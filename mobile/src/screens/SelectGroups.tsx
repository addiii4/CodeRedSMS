import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextStyle, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import spacing from '../constants/spacing';
import color from '../constants/color';
import typography from '../constants/typography';
import SearchBar from '../components/SearchBar';
import BottomCTA from '../components/BottomCTA';
import NavBar from '../components/NavBar';
import useAppNavigation from '../hooks/useAppNavigation';
import { groupsApi, Group } from '../services/groups';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../constants/types';

export default function SelectGroups() {
    const navigation = useAppNavigation();
    const [groups, setGroups] = useState<Group[]>([]);
    const [selected, setSelected] = useState<Record<string, boolean>>({});
    const [q, setQ] = useState('');
    const route = useRoute<RouteProp<RootStackParamList, 'SelectGroups'>>();
    const draftTitle = route.params?.draftTitle ?? '';
    const draftBody  = route.params?.draftBody  ?? '';

    const [selectedGroupIds, setSelectedGroupIds]   = useState<Set<string>>(new Set());
    const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());
    const [adHocNumbers, setAdHocNumbers] = useState<string[]>([]);

    useEffect(() => {
        groupsApi
            .list()
            .then(setGroups)
            .catch((e: any) => Alert.alert('Error', e.message));
        }, []);
    
        const toggle = (id: string) => {
            setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
        };

        const onNext = () => {
        const ids = Object.keys(selected).filter(id => selected[id]);
        if (ids.length === 0) {
            Alert.alert('Select at least one group');
            return;
        }
        navigation.navigate('ScheduleReview', {
            title: draftTitle,
            body: draftBody,
            groupIds: ids,
            contactIds: [],        
            adHocNumbers: [],     
        });
    };

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
                    {groups
                        .filter(g => g.name.toLowerCase().includes(q.toLowerCase()))
                        .map(g => {
                            const checked = !!selected[g.id];
                            return (
                                <Pressable
                                    key={g.id}
                                    onPress={() => toggle(g.id)}
                                    style={{
                                        paddingVertical: spacing.md,
                                        borderBottomWidth: 1,
                                        borderBottomColor: '#00000012',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <View>
                                        <Text style={{ ...typography.body } as TextStyle}>{g.name}</Text>
                                        <Text style={{ ...typography.caption, color: '#8E8E8E' } as TextStyle}>
                                            {(g.members || []).length} members
                                        </Text>
                                    </View>

                                    {/* simple checkbox dot */}
                                    <View style={{
                                        width: 22, height: 22, borderRadius: 11,
                                        borderWidth: 2, borderColor: checked ? color.primary : '#CFCFCF',
                                        alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {checked ? (
                                            <View style={{
                                                width: 12, height: 12, borderRadius: 6, backgroundColor: color.primary
                                            }} />
                                        ) : null}
                                    </View>
                                </Pressable>
                            );
                        })
                    }
                
                {/*    {Object.entries(checked).map(([label, isChecked]) => (
                        <CheckboxRow
                            key={label}
                            label={label}
                            count={label.includes('Tenants') ? 120 : label.includes('Maintenance') ? 32 : 8}
                            checked={isChecked}
                            onToggle={() => toggle(label)}
                        />
                    ))} */}
                </View>
                {//<Text style={styles.helper}>Selected groups: {selectedCount}</Text>}
                }
                <BottomCTA label="Next · Schedule" onPress={() =>
                    navigation.navigate('ScheduleReview', {
                        title: draftTitle,               // from route.params
                        body: draftBody,                 // from route.params
                        groupIds: Array.from(selectedGroupIds),
                        contactIds: Array.from(selectedContactIds),
                        adHocNumbers: adHocNumbers.length ? adHocNumbers : [],
                    })
                }/>
            </ScrollView>
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