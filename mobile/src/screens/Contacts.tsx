import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextStyle, Alert } from 'react-native';
import spacing from '../constants/spacing';
import color from '../constants/color';
import typography from '../constants/typography';
import SegmentedControl from '../components/SegmentedControl';
import SearchBar from '../components/SearchBar';
import ListRow from '../components/ListRow';
import BottomCTA from '../components/BottomCTA';
import NavBar from '../components/NavBar';
import useAppNavigation from '../hooks/useAppNavigation';
import { Contact, contactsApi } from '../services/contacts';
import { groupsApi, Group } from '../services/groups';

export default function Contacts() {
    const navigation = useAppNavigation();
    const [tab, setTab] = useState<'Groups' | 'People'>('Groups');
    const [q, setQ] = useState('');
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);

    useEffect(() => {
        load();
    }, []);

    useEffect(() => {
      // load groups once on mount
        groupsApi.list()
            .then(setGroups)
            .catch((e: any) => Alert.alert('Error', e.message));
    }, []);

    const load = async () => {
        try {
            const res = await contactsApi.list();
            setContacts(res);
        } catch (e: any) {
            Alert.alert('Error', e.message);
        }
    };

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
                        {groups
                            .filter(g => g.name.toLowerCase().includes(q.toLowerCase()))
                            .map(g => (
                                <ListRow
                                    key={g.id}
                                    title={g.name}
                                    meta={`${(g.members || []).length} members`}
                                    onPress={() => {
                                        navigation.navigate('GroupDetail')// Optional: navigate to a GroupDetail later
                                    }}
                                />
                            ))
                        }

                        {/* --- keep your original placeholders for now (commented) ---
                        <ListRow title="Maintenance Staff" meta="32 members" onPress={() => navigation.navigate('GroupDetail')} />
                        <ListRow title="Tenants – Tower A" meta="120 members" onPress={() => navigation.navigate('GroupDetail')} />
                        <ListRow title="Fire Wardens" meta="8 members" onPress={() => navigation.navigate('GroupDetail')} />
                        ------------------------------------------------------------ */}
                    </View>
                ) : (
                    <View style={{ marginTop: spacing.md }}>
                        {contacts
                            .filter(c =>
                                c.fullName.toLowerCase().includes(q.toLowerCase()) ||
                                c.phoneE164.toLowerCase().includes(q.toLowerCase())
                            )
                            .map(c => (
                                <ListRow
                                    key={c.id}
                                    title={c.fullName}
                                    meta={c.phoneE164}
                                    onPress={() => {}}
                                />
                            ))
                        }
                        {/* 
                        <ListRow title="Alice Chen" meta="+61 400 123 456" onPress={() => {}} />
                        <ListRow title="Ben Singh" meta="+61 400 987 654" onPress={() => {}} />
                        <ListRow title="Chris Walker" meta="+61 400 222 333" onPress={() => {}} />
                        */}
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