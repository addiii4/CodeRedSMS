import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextStyle } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import spacing from '../constants/spacing';
import color from '../constants/colors';
import typography from '../constants/typography';
import SegmentedControl from '../components/SegmentedControl';
import BottomCTA from '../components/BottomCTA';
import NavBar from '../components/NavBar';
import useAppNavigation from '../hooks/useAppNavigation';

export default function ScheduleReview() {
    const navigation = useAppNavigation();
    const [mode, setMode] = useState<'Send Now' | 'Schedule'>('Send Now');
    const [date, setDate] = useState<Date>(new Date());
    const [showPicker, setShowPicker] = useState(false);

    const onChange = (_: any, d?: Date) => {
        setShowPicker(false);
        if (d) setDate(d);
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.header}>Schedule & Review</Text>

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
                <Text style={[styles.sectionTitle]}>When to send</Text>
                <SegmentedControl
                    segments={['Send Now', 'Schedule']}
                    value={mode}
                    onChange={(v) => setMode(v as any)}
                    style={{ marginTop: spacing.sm }}
                />

                {mode === 'Schedule' && (
                    <View style={styles.scheduleBlock}>
                        <Pressable style={styles.scheduleRow} onPress={() => setShowPicker(true)}>
                            <Text style={styles.scheduleLabel}>Date & Time</Text>
                            <Text style={styles.scheduleValue}>
                                {date.toLocaleDateString()} · {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </Pressable>

                        {showPicker && (
                            <DateTimePicker
                                value={date}
                                mode="datetime"
                                display="default"
                                onChange={onChange}
                            />
                        )}

                        <Text style={styles.helperText}>
                            Times shown in your device timezone. Delivery may vary by carrier availability.
                        </Text>
                    </View>
                )}
            </ScrollView>

            <BottomCTA label={mode === 'Send Now' ? 'Send Message' : 'Schedule Message'} onPress={() => navigation.navigate('Logs' as never)} />
            <NavBar
                activeTab="compose"
                onHome={() => navigation.navigate('Dashboard' as never)}
                onCompose={() => navigation.navigate('Compose' as never)}
                onMenu={() => navigation.navigate('Settings' as never)}
            />
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
    header: {
        ...typography.title,
        marginBottom: spacing.md
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
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: '#00000010'
    },
    scheduleLabel: {
        ...typography.body
    } as TextStyle,
    scheduleValue: {
        ...typography.label,
        color: color.text
    } as TextStyle,
    helperText: {
        ...typography.label,
        color: '#8E8E8E',
        marginTop: spacing.md
    } as TextStyle
});