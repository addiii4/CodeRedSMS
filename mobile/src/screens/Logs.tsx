import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextStyle } from 'react-native';
import spacing from '../constants/spacing';
import color from '../constants/color';
import typography from '../constants/typography';
import SearchBar from '../components/SearchBar';
import Chip from '../components/Chip';
import ListRow from '../components/ListRow';
import NavBar from '../components/NavBar';
import useAppNavigation from '../hooks/useAppNavigation';

type Filter = 'All' | 'Delivered' | 'Failed' | 'Scheduled';

export default function Logs() {
    const navigation = useAppNavigation();
    const [q, setQ] = useState('');
    const [filter, setFilter] = useState<Filter>('All');

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.header}>Logs</Text>

                <SearchBar value={q} onChangeText={setQ} placeholder="Search logs…" />

                <View style={styles.chips}>
                    {(['All', 'Delivered', 'Failed', 'Scheduled'] as Filter[]).map((f) => (
                        <Chip key={f} label={f} active={filter === f} onPress={() => setFilter(f)} />
                    ))}
                </View>

                <View style={{ marginTop: spacing.md }}>
                    <ListRow title="Fire Alarm – Evacuate Now" meta="Delivered · Today 09:24" onPress={() => {}} />
                    <ListRow title="Maintenance Notice Tonight" meta="Failed · Yesterday 15:01" onPress={() => {}} />
                    <ListRow title="Evacuation Drill Reminder" meta="Scheduled · 12 Aug 10:30" onPress={() => {}} />
                </View>

                <View style={{ height: spacing.margin }} />
            </ScrollView>

            <NavBar
                activeTab="home"
                onHome={() => navigation.navigate('Dashboard')}
                onCompose={() => navigation.navigate('Compose')}
                onMenu={() => navigation.navigate('Settings')}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: color.background, justifyContent: 'space-between' },
    content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
    header: { ...typography.title, marginTop: spacing.margin, marginBottom: spacing.md } as TextStyle,
    chips: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }
});