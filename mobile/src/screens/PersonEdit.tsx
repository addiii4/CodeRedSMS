// /mobile/src/screens/PersonEdit.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextStyle,
  Alert,
  Pressable,
  ScrollView,
} from 'react-native';
import color from '../constants/color';
import spacing from '../constants/spacing';
import typography from '../constants/typography';
import BottomCTA from '../components/BottomCTA';
import NavBar from '../components/NavBar';
import useAppNavigation from '../hooks/useAppNavigation';
import HeaderBack from '../components/HeaderBack';
import { useRoute, RouteProp } from '@react-navigation/native';
import { contactsApi, Contact } from '../services/contacts';
import { groupsApi } from '../services/groups';

type RootStackParamList = {
  PersonEdit: { groupId?: string };
};

type Mode = 'new' | 'existing';

export default function PersonEdit() {
  const navigation = useAppNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'PersonEdit'>>();
  const groupId = route.params?.groupId;

  const [mode, setMode] = useState<Mode>('new');

  // New contact fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState(''); // kept for UI, not persisted

  // Existing contact picker
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [q, setQ] = useState('');
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return contacts;
    return contacts.filter(
      (c) =>
        c.fullName.toLowerCase().includes(s) ||
        c.phoneE164.toLowerCase().includes(s),
    );
  }, [contacts, q]);

  useEffect(() => {
    // Only load existing contacts list when we’re in a group context and user selects that tab
    if (mode !== 'existing') return;
    if (!groupId) return;

    (async () => {
      try {
        setLoadingContacts(true);
        const list = await contactsApi.list();
        setContacts(list);
      } catch (e: any) {
        Alert.alert('Error', e.message || 'Failed to load contacts');
      } finally {
        setLoadingContacts(false);
      }
    })();
  }, [mode, groupId]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const saveNewContactAndMaybeLink = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Full name is required.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Validation', 'Phone number is required.');
      return;
    }

    try {
      const created = await contactsApi.create({
        fullName: name.trim(),
        phoneE164: phone.trim(),
      });

      if (groupId) {
        await groupsApi.addMember(groupId, created.id);
      }

      Alert.alert(
        'Success',
        groupId ? 'Member added to group.' : 'Contact created.',
      );
      navigation.goBack();
    } catch (e: any) {
      console.error('Save Member Error:', e);
      Alert.alert('Error', e.message || 'Failed to save contact');
    }
  };

  const addExistingToGroup = async () => {
    if (!groupId) {
      Alert.alert('Error', 'No group context found.');
      return;
    }

    const ids = Object.keys(selectedIds).filter((k) => selectedIds[k]);
    if (ids.length === 0) {
      Alert.alert('Validation', 'Select at least one contact.');
      return;
    }

    try {
      // Add sequentially to keep it simple + reliable for demo
      for (const contactId of ids) {
        await groupsApi.addMember(groupId, contactId);
      }
      Alert.alert('Success', 'Members added to group.');
      navigation.goBack();
    } catch (e: any) {
      console.error('Add Existing Members Error:', e);
      Alert.alert('Error', e.message || 'Failed to add members');
    }
  };

  const ctaLabel =
    mode === 'new'
      ? groupId
        ? 'Save Member'
        : 'Save Contact'
      : 'Add Selected';

  const onPressCTA =
    mode === 'new' ? saveNewContactAndMaybeLink : addExistingToGroup;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={{ marginHorizontal: -spacing.lg }}>
          <HeaderBack title={groupId ? 'Add Member' : 'Add Contact'} />
        </View>

        {/* Mode toggle only makes sense when adding to a group */}
        {groupId ? (
          <View style={styles.segmentWrap}>
            <Pressable
              onPress={() => setMode('new')}
              style={[styles.segment, mode === 'new' && styles.segmentActive]}
            >
              <Text
                style={[
                  styles.segmentText,
                  mode === 'new' && styles.segmentTextActive,
                ]}
              >
                New
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setMode('existing')}
              style={[
                styles.segment,
                mode === 'existing' && styles.segmentActive,
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  mode === 'existing' && styles.segmentTextActive,
                ]}
              >
                Existing
              </Text>
            </Pressable>
          </View>
        ) : null}

        {mode === 'new' ? (
          <>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Alice Chen"
              placeholderTextColor={color.greyStroke}
            />

            <Text style={[styles.label, { marginTop: spacing.md }]}>
              Phone Number
            </Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+61 400 123 456"
              keyboardType="phone-pad"
              placeholderTextColor={color.greyStroke}
            />

            <Text style={[styles.label, { marginTop: spacing.md }]}>
              Role (optional)
            </Text>
            <TextInput
              style={styles.input}
              value={role}
              onChangeText={setRole}
              placeholder="e.g. Fire Warden"
              placeholderTextColor={color.greyStroke}
            />
          </>
        ) : (
          <>
            <Text style={styles.label}>Search Contacts</Text>
            <TextInput
              style={styles.input}
              value={q}
              onChangeText={setQ}
              placeholder="Search name or phone"
              placeholderTextColor={color.greyStroke}
            />

            <View style={{ height: spacing.sm }} />

            <View style={styles.listWrap}>
              <ScrollView
                style={styles.listCard}
                contentContainerStyle={{ paddingBottom: spacing.md }}
              >
                {loadingContacts ? (
                  <Text style={styles.meta}>Loading…</Text>
                ) : filtered.length === 0 ? (
                  <Text style={styles.meta}>No contacts found</Text>
                ) : (
                  filtered.map((c) => {
                    const selected = !!selectedIds[c.id];
                    return (
                      <Pressable
                        key={c.id}
                        onPress={() => toggleSelect(c.id)}
                        style={[styles.row, selected && styles.rowSelected]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.rowTitle}>{c.fullName}</Text>
                          <Text style={styles.rowMeta}>{c.phoneE164}</Text>
                        </View>
                        <Text style={styles.check}>{selected ? '✓' : ''}</Text>
                      </Pressable>
                    );
                  })
                )}
              </ScrollView>
            </View>
          </>
        )}
      </View>

      <View style={styles.footer}>
        <BottomCTA label={ctaLabel} onPress={onPressCTA} />
        <NavBar
          onHome={() => navigation.navigate('Dashboard')}
          onCompose={() => navigation.navigate('Compose')}
          onMenu={() => navigation.navigate('Settings')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.background,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  footer: { backgroundColor: color.background },

  label: { ...typography.label, color: color.text } as TextStyle,
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: color.greyStroke,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    backgroundColor: '#FFFFFF',
    marginTop: spacing.sm,
  },

  segmentWrap: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#00000010',
    borderRadius: 12,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  segment: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center' },
  segmentActive: { backgroundColor: color.primary },
  segmentText: { ...typography.label, color: color.text } as TextStyle,
  segmentTextActive: { ...typography.label, color: '#FFFFFF' } as TextStyle,

  listWrap: {
    flex: 1,
    marginTop: spacing.sm,
  },

  listCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00000010',
    padding: spacing.sm,
  },
  meta: {
    ...typography.caption,
    color: '#8E8E8E',
    padding: spacing.sm,
  } as TextStyle,

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
  },
  rowSelected: { backgroundColor: '#00000008' },
  rowTitle: { ...typography.label, color: color.text } as TextStyle,
  rowMeta: { ...typography.caption, color: '#8E8E8E' } as TextStyle,
  check: { width: 28, textAlign: 'center', ...typography.label } as TextStyle,
});
