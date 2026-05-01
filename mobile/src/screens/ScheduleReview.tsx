import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  Platform,
  TextStyle,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import spacing from '../constants/spacing';
import color from '../constants/color';
import typography from '../constants/typography';
import SegmentedControl from '../components/SegmentedControl';
import BottomCTA from '../components/BottomCTA';
import NavBar from '../components/NavBar';
import useAppNavigation from '../hooks/useAppNavigation';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../constants/types';
import { messagesApi } from '../services/messages';
import { groupsApi } from '../services/groups';

export default function ScheduleReview() {
  const navigation = useAppNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'ScheduleReview'>>();

  const [mode, setMode] = useState<'Send Now' | 'Schedule'>('Send Now');
  const [date, setDate] = useState<Date>(new Date());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [sending, setSending] = useState(false);
  const [realRecipientCount, setRealRecipientCount] = useState(0);

  const {
    title = '',
    body = '',
    groupIds = [],
    contactIds = [],
    adHocNumbers = [],
  } = route.params ?? {};

  useEffect(() => {
    let mounted = true;

    const loadRecipientCount = async () => {
      try {
        const groups = await groupsApi.list();

        const selectedGroups = groups.filter((g) => groupIds.includes(g.id));

        const memberContactIds = new Set<string>();
        selectedGroups.forEach((g) => {
          (g.members || []).forEach((m) => {
            if (m.contact?.id) memberContactIds.add(m.contact.id);
          });
        });

        contactIds.forEach((id) => memberContactIds.add(id));

        const total =
          memberContactIds.size + adHocNumbers.filter((n) => n.trim()).length;

        if (mounted) setRealRecipientCount(total);
      } catch (e) {
        if (mounted)
          setRealRecipientCount(contactIds.length + adHocNumbers.length);
      }
    };

    loadRecipientCount();

    return () => {
      mounted = false;
    };
  }, [groupIds, contactIds, adHocNumbers]);
  
  const onChange = (_: any, d?: Date) => {
    if (Platform.OS === 'android') setPickerOpen(false);
    if (d) setDate(d);
  };

  const openPicker = (m: 'date' | 'time') => {
    setPickerMode(m);
    setPickerOpen(true);
  };

  const charCount = body.length;
  const estimatedSegments = charCount <= 160 ? 1 : Math.ceil(charCount / 153);
  const estimatedRecipients =
    groupIds.length + contactIds.length + adHocNumbers.length;

  const handleSend = async () => {
    if (sending) return;

    if (!title.trim()) {
      Alert.alert('Validation', 'Message title is required.');
      return;
    }

    if (!body.trim()) {
      Alert.alert('Validation', 'Message body is required.');
      return;
    }

    if (
      groupIds.length === 0 &&
      contactIds.length === 0 &&
      adHocNumbers.length === 0
    ) {
      Alert.alert('Validation', 'Please select at least one recipient.');
      return;
    }

    try {
      setSending(true);

      const scheduledAtIso = mode === 'Schedule' ? date.toISOString() : null;

      const res = await messagesApi.create({
        title,
        body,
        groupIds,
        contactIds,
        adHocNumbers,
        scheduledAt: scheduledAtIso,
      });

      Alert.alert(
        mode === 'Send Now' ? '✓ Message Sent' : '✓ Message Scheduled',
        `${res.cost} credit${res.cost === 1 ? '' : 's'} used`,
        [{ text: 'OK', onPress: () => navigation.navigate('Dashboard') }],
      );
    } catch (e: any) {
      console.error('Send Message Error:', e);

      const msg = e?.message || e?.error || 'Please try again.';

      if (msg.toLowerCase().includes('insufficient credits')) {
        Alert.alert('Insufficient Credits');
      } else {
        Alert.alert('Send failed', msg);
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.back}>
            <Ionicons name="chevron-back" size={24} color={color.text} />
          </Pressable>
          <Text style={styles.header}>Schedule & Review</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.card}>
          <Text style={styles.meta}>Recipients</Text>
          <Text style={styles.body}>
            {[
              groupIds.length > 0 ? `${groupIds.length} group${groupIds.length === 1 ? '' : 's'}` : null,
              contactIds.length > 0 ? `${contactIds.length} contact${contactIds.length === 1 ? '' : 's'}` : null,
            ]
              .filter(Boolean)
              .join(' + ')}
            {realRecipientCount > 0
              ? ` · ${realRecipientCount} recipient${realRecipientCount === 1 ? '' : 's'} total`
              : ''}
          </Text>
          <Text
            style={styles.link}
            onPress={() => navigation.goBack()}
          >
            Edit
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.meta}>Message</Text>
          {!!title && (
            <Text style={[styles.body, { fontWeight: '600', marginBottom: 4 }]}>
              {title}
            </Text>
          )}
          <Text style={styles.body} numberOfLines={4}>
            {body || 'No message entered'}
          </Text>
          <Text style={styles.subMeta}>{charCount} chars</Text>
          <Text
            style={styles.link}
            onPress={() => navigation.pop(2)}
          >
            Edit
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.meta}>Credits (estimated)</Text>
          <Text style={styles.body}>
            {estimatedSegments} segment{estimatedSegments === 1 ? '' : 's'} ×{' '}
            {realRecipientCount} recipient{realRecipientCount === 1 ? '' : 's'}{' '}
            · ~{estimatedSegments * realRecipientCount} credit
            {estimatedSegments * realRecipientCount === 1 ? '' : 's'}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>When to send</Text>
        <SegmentedControl
          segments={['Send Now', 'Schedule']}
          value={mode}
          onChange={(v) => setMode(v as any)}
          style={{ marginTop: spacing.sm }}
        />

        {mode === 'Schedule' && (
          <View style={styles.scheduleBlock}>
            <View style={styles.scheduleRow}>
              <Text style={styles.scheduleLabel}>Date & Time</Text>
              <Text style={styles.scheduleHint}>
                {date.toLocaleDateString()} ·{' '}
                {date.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>

            <View style={styles.inlinePickers}>
              <Pressable style={styles.pill} onPress={() => openPicker('date')}>
                <Text style={styles.pillText}>
                  {date.toLocaleDateString(undefined, {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
              </Pressable>
              <Pressable style={styles.pill} onPress={() => openPicker('time')}>
                <Text style={styles.pillText}>
                  {date.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </Pressable>
            </View>

            <Text style={styles.helperText}>
              Times shown in your device timezone. Delivery may vary by carrier
              availability.
            </Text>
          </View>
        )}
      </ScrollView>

      <BottomCTA
        label={
          sending
            ? 'Sending...'
            : mode === 'Send Now'
              ? 'Send Message'
              : 'Schedule Message'
        }
        onPress={handleSend}
      />

      <NavBar
        onHome={() => navigation.navigate('Dashboard' as never)}
        onCompose={() => navigation.navigate('Compose' as never)}
        onMenu={() => navigation.navigate('Settings' as never)}
        disableCompose
      />

      <Modal
        transparent
        visible={pickerOpen}
        animationType="slide"
        onRequestClose={() => setPickerOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>
              Select {pickerMode === 'date' ? 'Date' : 'Time'}
            </Text>
            <DateTimePicker
              value={date}
              mode={pickerMode}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onChange}
              style={{ alignSelf: 'stretch' }}
            />
            <Pressable
              onPress={() => setPickerOpen(false)}
              style={styles.modalDone}
            >
              <Text style={styles.modalDoneText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.background },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 56 + 72 + spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.margin,
    marginBottom: spacing.md,
  },
  back: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  header: {
    ...typography.title,
    flex: 1,
    textAlign: 'left',
  } as TextStyle,

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00000010',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  meta: {
    ...typography.label,
    color: '#8E8E8E',
    marginBottom: 4,
  } as TextStyle,
  body: {
    ...typography.body,
  } as TextStyle,
  subMeta: {
    ...typography.label,
    color: '#8E8E8E',
    marginTop: 4,
  } as TextStyle,
  link: {
    ...typography.label,
    color: color.primary,
    fontWeight: 600,
    marginTop: spacing.sm,
  } as TextStyle,

  sectionTitle: {
    ...typography.sectionTitle,
    marginTop: spacing.lg,
  } as TextStyle,

  scheduleBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00000010',
    padding: spacing.md,
    marginTop: spacing.md,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#00000010',
  },
  scheduleLabel: {
    ...typography.body,
  } as TextStyle,
  scheduleHint: {
    ...typography.label,
    color: '#8E8E8E',
  } as TextStyle,
  inlinePickers: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  pill: {
    flex: 1,
    backgroundColor: '#F6F6F6',
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00000010',
  },
  pillText: {
    ...typography.body,
  } as TextStyle,
  helperText: {
    ...typography.label,
    color: '#8E8E8E',
    marginTop: spacing.md,
  } as TextStyle,

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    padding: spacing.lg,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: {
    ...typography.body,
    marginBottom: spacing.sm,
  } as TextStyle,
  modalDone: {
    alignSelf: 'flex-end',
    marginTop: spacing.md,
  },
  modalDoneText: {
    ...typography.label,
    color: color.primary,
    fontWeight: 600,
  } as TextStyle,
});
