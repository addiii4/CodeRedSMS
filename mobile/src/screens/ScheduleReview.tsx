import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, Platform, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import spacing from '../constants/spacing';
import color from '../constants/color';
import typography from '../constants/typography';
import SegmentedControl from '../components/SegmentedControl';
import BottomCTA from '../components/BottomCTA';
import NavBar from '../components/NavBar';
import useAppNavigation from '../hooks/useAppNavigation';

export default function ScheduleReview() {
    const navigation = useAppNavigation();

    const [mode, setMode] = useState<'Send Now' | 'Schedule'>('Send Now');
    const [date, setDate] = useState<Date>(new Date());
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

    const onChange = (_: any, d?: Date) => {
        // Android fires onChange immediately; iOS updates while spinning
        if (Platform.OS === 'android') setPickerOpen(false);
        if (d) setDate(d);
    };

    const openPicker = (m: 'date' | 'time') => {
        setPickerMode(m);
        setPickerOpen(true);
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Header with Back */}
                <View style={styles.topRow}>
                    <Pressable onPress={() => navigation.goBack()} style={styles.back}>
                        <Ionicons name="chevron-back" size={24} color={color.text} />
                    </Pressable>
                    <Text style={styles.header}>Schedule & Review</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Summary Cards */}
                <View style={styles.card}>
                    <Text style={styles.meta}>Recipients</Text>
                    <Text style={styles.body}>3 groups · 160 people</Text>
                    <Text style={styles.link} onPress={() => navigation.navigate('SelectGroups' as never)}>Edit</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.meta}>Message</Text>
                    <Text style={styles.body} numberOfLines={2}>
                        Fire Alarm – Evacuate Now. Please proceed to the nearest exit and assemble at the designated area.
                    </Text>
                    <Text style={styles.subMeta}>148 chars</Text>
                    <Text style={styles.link} onPress={() => navigation.navigate('Compose' as never)}>Edit</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.meta}>Credits (estimated)</Text>
                    <Text style={styles.body}>1 credit / 160 chars · ~1 credit</Text>
                </View>

                {/* When to send */}
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
                                {date.toLocaleDateString()} · {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>

                        <View style={styles.inlinePickers}>
                            <Pressable style={styles.pill} onPress={() => openPicker('date')}>
                                <Text style={styles.pillText}>
                                    {date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                </Text>
                            </Pressable>
                            <Pressable style={styles.pill} onPress={() => openPicker('time')}>
                                <Text style={styles.pillText}>
                                    {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </Pressable>
                        </View>

                        <Text style={styles.helperText}>
                            Times shown in your device timezone. Delivery may vary by carrier availability.
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Bottom CTA above NavBar */}
            <BottomCTA
                label={mode === 'Send Now' ? 'Send Message' : 'Schedule Message'}
                onPress={() => navigation.navigate('Logs' as never)}
            />

            <NavBar
                activeTab="home"
                onHome={() => navigation.navigate('Dashboard' as never)}
                onCompose={() => navigation.navigate('Compose' as never)}
                onMenu={() => navigation.navigate('Settings' as never)}
            />

            {/* Modal Date/Time Picker to avoid layout jumps */}
            <Modal transparent visible={pickerOpen} animationType="slide" onRequestClose={() => setPickerOpen(false)}>
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalSheet}>
                        <Text style={styles.modalTitle}>Select {pickerMode === 'date' ? 'Date' : 'Time'}</Text>
                        <DateTimePicker
                            value={date}
                            mode={pickerMode}
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onChange}
                            style={{ alignSelf: 'stretch' }}
                        />
                        <Pressable onPress={() => setPickerOpen(false)} style={styles.modalDone}>
                            <Text style={styles.modalDoneText}>Done</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: color.background
    },
    content: {
        paddingHorizontal: spacing.lg,
        paddingTop: 56,
        paddingBottom: 56 + 72 + spacing.md
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md
    },
    back: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        marginRight: spacing.sm
    },
    header: {
        ...typography.title,
        flex: 1,
        textAlign: 'left'
    } as TextStyle,

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#00000010',
        padding: spacing.md,
        marginBottom: spacing.md
    },
    meta: {
        ...typography.label,
        color: '#8E8E8E',
        marginBottom: 4
    } as TextStyle,
    body: {
        ...typography.body
    } as TextStyle,
    subMeta: {
        ...typography.label,
        color: '#8E8E8E',
        marginTop: 4
    } as TextStyle,
    link: {
        ...typography.label,
        color: color.primary,
        fontWeight: 600,
        marginTop: spacing.sm
    } as TextStyle,

    sectionTitle: {
        ...typography.sectionTitle,
        marginTop: spacing.lg
    } as TextStyle,

    scheduleBlock: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#00000010',
        padding: spacing.md,
        marginTop: spacing.md
    },
    scheduleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: '#00000010'
    },
    scheduleLabel: {
        ...typography.body
    } as TextStyle,
    scheduleHint: {
        ...typography.label,
        color: '#8E8E8E'
    } as TextStyle,
    inlinePickers: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.md
    },
    pill: {
        flex: 1,
        backgroundColor: '#F6F6F6',
        paddingVertical: spacing.md,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#00000010'
    },
    pillText: {
        ...typography.body
    } as TextStyle,
    helperText: {
        ...typography.label,
        color: '#8E8E8E',
        marginTop: spacing.md
    } as TextStyle,

    // Modal styles
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'flex-end'
    },
    modalSheet: {
        backgroundColor: '#FFFFFF',
        padding: spacing.lg,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16
    },
    modalTitle: {
        ...typography.body,
        marginBottom: spacing.sm
    } as TextStyle,
    modalDone: {
        alignSelf: 'flex-end',
        marginTop: spacing.md
    },
    modalDoneText: {
        ...typography.label,
        color: color.primary,
        fontWeight: 600
    } as TextStyle
});