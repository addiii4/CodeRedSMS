import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextStyle, Alert } from 'react-native';
import Colors from '../constants/color';
import Spacing from '../constants/spacing';
import Typography from '../constants/typography';
import { useAuth } from '../state/auth';

export default function PendingApproval() {
    const { user, memberships, refreshMe, logout } = useAuth();
    const [refreshing, setRefreshing] = useState(false);

    const pendingOrgRequest  = memberships.find((m) => m.org.status === 'pending');
    const pendingMembership  = memberships.find((m) => m.status === 'pending' && m.org.status === 'active');

    const handleRefresh = async () => {
        setRefreshing(true);
        try { await refreshMe(); }
        catch (e: any) { Alert.alert('Refresh failed', e?.message || 'Try again later.'); }
        finally { setRefreshing(false); }
    };

    return (
        <View style={styles.container}>
            <Image source={require('../../src/assets/logo.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.title}>Pending Approval</Text>
            <Text style={styles.caption}>
                Hi {user?.displayName}, your account is awaiting approval before you can send messages.
            </Text>

            {pendingOrgRequest && (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>New organisation: {pendingOrgRequest.org.name}</Text>
                    <Text style={styles.cardBody}>
                        The Code Red team is reviewing your request. You'll be notified by email once approved (usually within 1 business day).
                    </Text>
                </View>
            )}

            {pendingMembership && (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Joining: {pendingMembership.org.name}</Text>
                    <Text style={styles.cardBody}>
                        Your access request has been sent to the organisation's admin. They need to approve you before you can send messages.
                    </Text>
                </View>
            )}

            <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh} disabled={refreshing}>
                <Text style={styles.refreshText}>{refreshing ? 'Checking…' : 'Refresh status'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                <Text style={styles.logoutText}>Sign out</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.lg, justifyContent: 'center', alignItems: 'center' },
    logo: { width: 64, height: 64, marginBottom: Spacing.md },
    title: { ...Typography.title, marginBottom: Spacing.sm, textAlign: 'center' } as TextStyle,
    caption: { ...Typography.body, color: '#666', textAlign: 'center', marginBottom: Spacing.lg } as TextStyle,
    card: { backgroundColor: '#FFF8E1', borderColor: '#FFD54F', borderWidth: 1, borderRadius: 12, padding: Spacing.md, marginBottom: Spacing.md, width: '100%' },
    cardTitle: { ...Typography.body, fontWeight: '600', marginBottom: 4 } as TextStyle,
    cardBody: { ...Typography.caption, color: '#5d4037' } as TextStyle,
    refreshButton: { backgroundColor: Colors.primary, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, borderRadius: 12, marginTop: Spacing.lg },
    refreshText: { ...Typography.body, color: '#FFF', fontWeight: '600' } as TextStyle,
    logoutButton: { marginTop: Spacing.md, padding: Spacing.sm },
    logoutText: { ...Typography.caption, color: '#888' } as TextStyle,
});
