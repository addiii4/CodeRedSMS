import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextStyle,
    Pressable,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import spacing from '../constants/spacing';
import color from '../constants/color';
import typography from '../constants/typography';
import SearchBar from '../components/SearchBar';
import BottomCTA from '../components/BottomCTA';
import NavBar from '../components/NavBar';
import useAppNavigation from '../hooks/useAppNavigation';
import { groupsApi, Group } from '../services/groups';
import { contactsApi, Contact } from '../services/contacts';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../constants/types';

type SelectGroupsRoute = RouteProp<RootStackParamList, 'SelectGroups'>;

function CheckCircle({ checked }: { checked: boolean }) {
    return (
        <View
            style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                borderWidth: 2,
                borderColor: checked ? color.primary : '#CFCFCF',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {checked ? (
                <View
                    style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: color.primary,
                    }}
                />
            ) : null}
        </View>
    );
}

export default function SelectGroups() {
    const navigation = useAppNavigation();
    const route = useRoute<SelectGroupsRoute>();
    const draftTitle = route.params?.draftTitle ?? '';
    const draftBody  = route.params?.draftBody  ?? '';

    const [groups, setGroups]     = useState<Group[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedGroups, setSelectedGroups]     = useState<Record<string, boolean>>({});
    const [selectedContacts, setSelectedContacts] = useState<Record<string, boolean>>({});
    const [q, setQ] = useState('');

    useEffect(() => {
        groupsApi
            .list()
            .then(setGroups)
            .catch((e: any) => Alert.alert('Error loading groups', e.message));

        contactsApi
            .list()
            .then(setContacts)
            .catch((e: any) => Alert.alert('Error loading contacts', e.message));
    }, []);

    const toggleGroup   = (id: string) =>
        setSelectedGroups((prev) => ({ ...prev, [id]: !prev[id] }));

    const toggleContact = (id: string) =>
        setSelectedContacts((prev) => ({ ...prev, [id]: !prev[id] }));

    const filteredGroups = groups.filter((g) =>
        g.name.toLowerCase().includes(q.toLowerCase())
    );

    const filteredContacts = contacts.filter(
        (c) =>
            c.fullName.toLowerCase().includes(q.toLowerCase()) ||
            c.phoneE164.includes(q)
    );

    const selectedGroupCount   = Object.values(selectedGroups).filter(Boolean).length;
    const selectedContactCount = Object.values(selectedContacts).filter(Boolean).length;
    const totalSelected = selectedGroupCount + selectedContactCount;

    const onNext = () => {
        if (totalSelected === 0) {
            Alert.alert('No recipients', 'Select at least one group or contact.');
            return;
        }
        const groupIds   = Object.keys(selectedGroups).filter((id) => selectedGroups[id]);
        const contactIds = Object.keys(selectedContacts).filter((id) => selectedContacts[id]);

        navigation.navigate('ScheduleReview', {
            title: draftTitle,
            body: draftBody,
            groupIds,
            contactIds,
            adHocNumbers: [],
        });
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Header */}
                <View style={styles.topRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
                        <Ionicons name="chevron-back" size={24} color={color.text} />
                    </TouchableOpacity>
                    <Text style={styles.header}>Choose Recipients</Text>
                    <View style={{ width: 24 }} />
                </View>

                <SearchBar value={q} onChangeText={setQ} placeholder="Search groups or contacts…" />

                {/* Groups section */}
                {filteredGroups.length > 0 && (
                    <View style={{ marginTop: spacing.md }}>
                        <Text style={styles.sectionLabel}>Groups</Text>
                        {filteredGroups.map((g) => {
                            const checked = !!selectedGroups[g.id];
                            return (
                                <Pressable
                                    key={g.id}
                                    onPress={() => toggleGroup(g.id)}
                                    style={styles.row}
                                >
                                    <View>
                                        <Text style={styles.rowTitle}>{g.name}</Text>
                                        <Text style={styles.rowMeta}>
                                            {(g.members || []).length} member{(g.members || []).length !== 1 ? 's' : ''}
                                        </Text>
                                    </View>
                                    <CheckCircle checked={checked} />
                                </Pressable>
                            );
                        })}
                    </View>
                )}

                {/* Contacts section */}
                {filteredContacts.length > 0 && (
                    <View style={{ marginTop: spacing.md }}>
                        <Text style={styles.sectionLabel}>Individual Contacts</Text>
                        {filteredContacts.map((c) => {
                            const checked = !!selectedContacts[c.id];
                            return (
                                <Pressable
                                    key={c.id}
                                    onPress={() => toggleContact(c.id)}
                                    style={styles.row}
                                >
                                    <View style={{ flex: 1, marginRight: spacing.sm }}>
                                        <Text style={styles.rowTitle}>{c.fullName}</Text>
                                        <Text style={styles.rowMeta}>{c.phoneE164}</Text>
                                    </View>
                                    <CheckCircle checked={checked} />
                                </Pressable>
                            );
                        })}
                    </View>
                )}

                {/* Empty state */}
                {filteredGroups.length === 0 && filteredContacts.length === 0 && (
                    <View style={{ marginTop: spacing.xl, alignItems: 'center' }}>
                        <Text style={{ ...typography.body, color: '#8E8E8E' } as TextStyle}>
                            {q
                                ? 'No results found.'
                                : 'No groups or contacts yet. Add some in Contacts first.'}
                        </Text>
                    </View>
                )}

                <View style={{ height: spacing.margin }} />
            </ScrollView>

            <BottomCTA
                label={
                    totalSelected > 0
                        ? `Next · Schedule (${totalSelected} selected)`
                        : 'Next · Schedule'
                }
                onPress={onNext}
            />

            <NavBar
                onHome={() => navigation.navigate('Dashboard' as never)}
                onCompose={() => navigation.navigate('Compose' as never)}
                onMenu={() => navigation.navigate('Settings' as never)}
                disableCompose
            />
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
    sectionLabel: {
        ...typography.label,
        color: '#8E8E8E',
        marginBottom: spacing.sm,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    } as TextStyle,
    row: {
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#00000012',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    rowTitle: {
        ...typography.body,
    } as TextStyle,
    rowMeta: {
        ...typography.caption,
        color: '#8E8E8E',
    } as TextStyle,
});
