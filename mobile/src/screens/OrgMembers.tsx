import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextStyle, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import color from '../constants/color';
import spacing from '../constants/spacing';
import typography from '../constants/typography';
import NavBar from '../components/NavBar';
import HeaderBack from '../components/HeaderBack';
import useAppNavigation from '../hooks/useAppNavigation';
import { orgsApi, OrgMember } from '../services/orgs';
import { useAuth } from '../state/auth';

const ROLE_LABEL: Record<OrgMember['role'], string> = { admin: 'Admin', editor: 'Editor', viewer: 'Viewer' };

export default function OrgMembers() {
    const navigation = useAppNavigation();
    const { activeMembership } = useAuth();
    const [members, setMembers] = useState<OrgMember[]>([]);
    const isAdmin = activeMembership?.role === 'admin';

    const load = useCallback(() => {
        orgsApi.getMembers().then(setMembers).catch(() => {});
    }, []);

    useFocusEffect(useCallback(() => { load(); }, [load]));

    const pending = members.filter((m) => m.status === 'pending');
    const active  = members.filter((m) => m.status === 'active');

    const approve = async (m: OrgMember) => {
        try { await orgsApi.approveMember(m.membershipId); load(); }
        catch (e: any) { Alert.alert('Approve failed', e?.message); }
    };
    const reject = async (m: OrgMember) => {
        Alert.alert('Reject member?', `Remove ${m.displayName}'s access request?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Reject', style: 'destructive', onPress: async () => {
                try { await orgsApi.rejectMember(m.membershipId); load(); }
                catch (e: any) { Alert.alert('Reject failed', e?.message); }
            }},
        ]);
    };
    const changeRole = (m: OrgMember) => {
        Alert.alert('Change role', `${m.displayName} — choose new role:`, [
            { text: 'Admin', onPress: () => setRole(m, 'admin') },
            { text: 'Editor', onPress: () => setRole(m, 'editor') },
            { text: 'Viewer', onPress: () => setRole(m, 'viewer') },
            { text: 'Cancel', style: 'cancel' },
        ]);
    };
    const setRole = async (m: OrgMember, role: 'admin' | 'editor' | 'viewer') => {
        try { await orgsApi.setMemberRole(m.membershipId, role); load(); }
        catch (e: any) { Alert.alert('Update failed', e?.message); }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={{ marginHorizontal: -spacing.lg }}>
                    <HeaderBack title="Members" />
                </View>

                {/* Pending */}
                {pending.length > 0 && (
                    <View style={{ marginBottom: spacing.lg }}>
                        <Text style={styles.sectionLabel}>Pending approval ({pending.length})</Text>
                        {pending.map((m) => (
                            <View key={m.membershipId} style={styles.pendingCard}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.name}>{m.displayName}</Text>
                                    <Text style={styles.meta}>{m.email}</Text>
                                </View>
                                {isAdmin ? (
                                    <View style={styles.actions}>
                                        <TouchableOpacity onPress={() => approve(m)} style={[styles.actionBtn, styles.approveBtn]}>
                                            <Text style={styles.actionTextLight}>Approve</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => reject(m)} style={[styles.actionBtn, styles.rejectBtn]}>
                                            <Text style={styles.actionTextDark}>Reject</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <Text style={styles.meta}>Waiting…</Text>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* Active */}
                <Text style={styles.sectionLabel}>Active members ({active.length})</Text>
                {active.map((m) => (
                    <TouchableOpacity
                        key={m.membershipId}
                        style={styles.row}
                        onPress={() => isAdmin && changeRole(m)}
                        disabled={!isAdmin}
                    >
                        <View style={{ flex: 1 }}>
                            <Text style={styles.name}>{m.displayName}</Text>
                            <Text style={styles.meta}>{m.email} · {ROLE_LABEL[m.role]}</Text>
                        </View>
                        {isAdmin && <Text style={styles.chevron}>›</Text>}
                    </TouchableOpacity>
                ))}

                <View style={{ height: spacing.margin }} />
            </ScrollView>
            <NavBar
                onHome={() => navigation.navigate('Dashboard')}
                onCompose={() => navigation.navigate('Compose')}
                onMenu={() => navigation.navigate('Settings')}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: color.background },
    content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
    sectionLabel: { ...typography.label, color: '#888', textTransform: 'uppercase', marginBottom: spacing.sm, letterSpacing: 0.5 } as TextStyle,
    pendingCard: { backgroundColor: '#FFF8E1', borderColor: '#FFD54F', borderWidth: 1, borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm, flexDirection: 'row', alignItems: 'center' },
    row: { backgroundColor: '#FFF', borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#00000010' },
    name: { ...typography.body, fontWeight: '600' } as TextStyle,
    meta: { ...typography.caption, color: '#888' } as TextStyle,
    actions: { flexDirection: 'row', gap: spacing.xs },
    actionBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
    approveBtn: { backgroundColor: color.primary },
    rejectBtn: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CCC' },
    actionTextLight: { ...typography.caption, color: '#FFF', fontWeight: '600' } as TextStyle,
    actionTextDark: { ...typography.caption, color: '#666', fontWeight: '600' } as TextStyle,
    chevron: { fontSize: 20, color: '#CCC', marginLeft: spacing.sm },
});
