import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextStyle } from 'react-native';
import spacing from '../constants/spacing';
import color from '../constants/color';
import typography from '../constants/typography';
import SegmentedControl from '../components/SegmentedControl';
import SearchBar from '../components/SearchBar';
import ListRow from '../components/ListRow';
import BottomCTA from '../components/BottomCTA';
import NavBar from '../components/NavBar';
import useAppNavigation from '../hooks/useAppNavigation';

export default function Contacts() {
    const navigation = useAppNavigation();
    const [tab, setTab] = useState<'Groups' | 'People'>('Groups');
    const [q, setQ] = useState('');

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.header}>Contacts</Text>
                <SegmentedControl segments={['Groups', 'People']} value={tab} onChange={(v) => setTab(v as any)} style={{ marginTop: spacing.md }} />
                <View style={{ marginTop: spacing.md }}>
                    <SearchBar value={q} onChangeText={setQ} placeholder={`Search ${tab.toLowerCase()}…`} />
                </View>

                {tab === 'Groups' ? (
                    <View style={{ marginTop: spacing.md }}>
                        <ListRow title="Maintenance Staff" meta="32 members" onPress={() => navigation.navigate('GroupDetail')} />
                        <ListRow title="Tenants – Tower A" meta="120 members" onPress={() => navigation.navigate('GroupDetail')} />
                        <ListRow title="Fire Wardens" meta="8 members" onPress={() => navigation.navigate('GroupDetail')} />
                    </View>
                ) : (
                    <View style={{ marginTop: spacing.md }}>
                        <ListRow title="Alice Chen" meta="+61 400 123 456" onPress={() => {}} />
                        <ListRow title="Ben Singh" meta="+61 400 987 654" onPress={() => {}} />
                        <ListRow title="Chris Walker" meta="+61 400 222 333" onPress={() => {}} />
                    </View>
                )}

                <View style={{ height: spacing.margin }} />
            </ScrollView>

            <BottomCTA label={tab === 'Groups' ? 'New Group' : 'Add Person'} onPress={() => navigation.navigate(tab === 'Groups' ? 'GroupEdit' : 'PersonEdit')} />

            <NavBar
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
    header: { ...typography.title, marginTop: spacing.margin, marginBottom: spacing.md } as TextStyle
});