import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import spacing from '../constants/spacing';
import color from '../constants/color';
import typography from '../constants/typography';
import SearchBar from '../components/SearchBar';
import CheckboxRow from '../components/CheckboxRow';
import BottomCTA from '../components/BottomCTA';
import NavBar from '../components/NavBar';
import useAppNavigation from '../hooks/useAppNavigation';
import Spacing from '../constants/spacing';

export default function SelectGroups() {
    const navigation = useAppNavigation();
    const [q, setQ] = useState('');
    const [checked, setChecked] = useState<Record<string, boolean>>({
        'Maintenance Staff': true,
        'Tenants – Tower A': false,
        'Fire Wardens': false
    });

    const toggle = (k: string) => setChecked((s) => ({ ...s, [k]: !s[k] }));
    const selectedCount = Object.values(checked).filter(Boolean).length;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Header with Back */}
                <View style={styles.topRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
                        <Ionicons name="chevron-back" size={24} color={color.text} />
                    </TouchableOpacity>
                    <Text style={styles.header}>Choose Recipients</Text>
                    <View style={{ width: 24 }} />
                </View>

                <SearchBar value={q} onChangeText={setQ} placeholder="Search groups…" />

                <View style={{ marginTop: spacing.md }}>
                    {Object.entries(checked).map(([label, isChecked]) => (
                        <CheckboxRow
                            key={label}
                            label={label}
                            count={label.includes('Tenants') ? 120 : label.includes('Maintenance') ? 32 : 8}
                            checked={isChecked}
                            onToggle={() => toggle(label)}
                        />
                    ))}
                </View>
                <Text style={styles.helper}>Selected groups: {selectedCount}</Text>
            </ScrollView>

            <BottomCTA label="Next · Schedule" onPress={() => navigation.navigate('ScheduleReview' as never)} />

            <NavBar
                activeTab="home"
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
        paddingBottom: 56 + 72 + spacing.md
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.margin,
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
    helper: {
        ...typography.label,
        color: '#8E8E8E',
        marginTop: spacing.sm,
        textAlign: 'right'
    } as TextStyle
});