import React, { useCallback, useState } from 'react';
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity,
    TextStyle, Alert,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/color';
import Spacing from '../constants/spacing';
import Typography from '../constants/typography';
import SecTitle from '../components/SecTitle';
import CreditsBadge from '../components/CreditsBadge';
import ActivityCard from '../components/ActivityCard';
import PrimaryButton from '../components/PrimaryButton';
import QuickActionButton from '../components/QuickActionButton';
import NavBar from '../components/NavBar';
import PasswordGateModal from '../components/PasswordGateModal';
import useAppNavigation from '../hooks/useAppNavigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { messagesApi } from '../services/messages';
import { paymentsApi } from '../services/payments';
import { PREF_LOW_CREDIT_ALERTS } from './Settings';
import { useAuth } from '../state/auth';

const LOW_CREDIT_THRESHOLD = 20;
// Fires at most once per app session — prevents alert on every navigation.
let lowCreditAlertShownThisSession = false;

// ── Status icon ──────────────────────────────────────────────────────────────
type StatusIconName = 'checkmark-circle-outline' | 'close-circle-outline' | 'hourglass-outline' | 'time-outline' | 'arrow-forward-circle-outline';

function statusIcon(status: string): { name: StatusIconName; color: string } {
    switch (status) {
        case 'sent':       return { name: 'checkmark-circle-outline', color: '#2C2C2C' };
        case 'failed':     return { name: 'close-circle-outline',      color: '#D32F2F' };
        case 'scheduled':
        case 'queued':     return { name: 'hourglass-outline',         color: '#E65100' };
        case 'sending':    return { name: 'arrow-forward-circle-outline', color: '#1565C0' };
        default:           return { name: 'time-outline',              color: '#757575' };
    }
}

function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
        + ' · '
        + d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
}

// ── Log item card ─────────────────────────────────────────────────────────────
type LogItem = { id: string; title: string; status: string; createdAt: string; scheduledAt: string | null };

function LogCard({ item, onPress }: { item: LogItem; onPress: () => void }) {
    const { name, color } = statusIcon(item.status);
    return (
        <TouchableOpacity style={logStyles.card} onPress={onPress} activeOpacity={0.7}>
            <Ionicons name={name} size={22} color={color} style={logStyles.icon} />
            <View style={logStyles.body}>
                <Text style={logStyles.title} numberOfLines={1}>{item.title}</Text>
                <Text style={logStyles.date}>{formatDate(item.createdAt)}</Text>
            </View>
        </TouchableOpacity>
    );
}

const logStyles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#00000008',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    icon: { marginRight: Spacing.md },
    body: { flex: 1 },
    title: { ...Typography.body, fontWeight: '600' } as TextStyle,
    date: { ...Typography.caption, color: '#8E8E8E', marginTop: 2 } as TextStyle,
});

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
    const navigation = useAppNavigation();
    const { activeMembership } = useAuth();
    const isAdmin = activeMembership?.role === 'admin';

    const [recentLogs, setRecentLogs] = useState<LogItem[]>([]);
    const [credits, setCredits] = useState(0);
    const [gateVisible, setGateVisible] = useState(false);

    /** Tapping credits = buy more. Only admins may; others get a polite block. */
    const handleBilling = () => {
        if (!isAdmin) {
            Alert.alert('Admin only', 'Only org admins can buy credits. Please ask your admin to top up.');
            return;
        }
        setGateVisible(true);
    };

    useFocusEffect(
        useCallback(() => {
            paymentsApi
                .balance()
                .then(async (res: { credits: number }) => {
                    setCredits(res.credits);
                    if (!lowCreditAlertShownThisSession && res.credits < LOW_CREDIT_THRESHOLD) {
                        const pref = await SecureStore.getItemAsync(PREF_LOW_CREDIT_ALERTS);
                        if (pref !== 'false') {
                            lowCreditAlertShownThisSession = true;
                            Alert.alert(
                                '⚠️ Low Credits',
                                `You have ${res.credits} credit${res.credits === 1 ? '' : 's'} remaining.`,
                                [
                                    { text: 'Buy Credits', onPress: handleBilling },
                                    { text: 'Dismiss' },
                                ],
                            );
                        }
                    }
                })
                .catch((e: any) => console.error('Load dashboard credits failed', e));
        }, []),
    );

    useFocusEffect(
        useCallback(() => {
            let active = true;
            messagesApi
                .list()
                .then((res) => { if (active) setRecentLogs(res.items.slice(0, 3)); })
                .catch((e: any) => console.error('Dashboard logs load error:', e));
            return () => { active = false; };
        }, []),
    );

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <SafeAreaView edges={['top']} style={{ paddingTop: Spacing.md }}>
                    <View style={styles.header}>
                        <Text style={styles.title as any}>Dashboard</Text>
                        <CreditsBadge
                            credits={credits}
                            onPress={handleBilling}
                        />
                    </View>
                </SafeAreaView>

                {/* Quick Actions — top half */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionsGrid}>
                    <QuickActionButton
                        label="Support"
                        icon="help-circle-outline"
                        onPress={() => navigation.navigate('HelpCenter' as never)}
                    />
                    <QuickActionButton
                        label="Contacts"
                        icon="people-outline"
                        onPress={() => navigation.navigate('Contacts' as never)}
                    />
                    <QuickActionButton
                        label="Templates"
                        icon="description"
                        lib="mat"
                        onPress={() => navigation.navigate('Templates' as never)}
                    />
                    <QuickActionButton
                        label="Logs"
                        icon="list"
                        lib="mat"
                        onPress={() => navigation.navigate('Logs' as never)}
                    />
                </View>

                {/* Recent Activity — bottom half */}
                <View style={{ marginTop: Spacing.md }}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                    {recentLogs.length === 0 ? (
                        <ActivityCard text="No recent activity yet" />
                    ) : (
                        recentLogs.map((item) => (
                            <LogCard
                                key={item.id}
                                item={item}
                                onPress={() => navigation.navigate('LogDetail', { id: item.id })}
                            />
                        ))
                    )}
                    <PrimaryButton
                        label="View All Logs"
                        onPress={() => navigation.navigate('Logs' as never)}
                    />
                </View>
            </ScrollView>

            <NavBar
                activeTab="home"
                onHome={() => navigation.navigate('Dashboard' as never)}
                onCompose={() => navigation.navigate('Compose' as never)}
                onMenu={() => navigation.navigate('Settings' as never)}
            />

            {/* Password gate for billing access */}
            <PasswordGateModal
                visible={gateVisible}
                title="Billing Access"
                onSuccess={() => {
                    setGateVisible(false);
                    navigation.navigate('BuyCredits');
                }}
                onCancel={() => setGateVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scrollContent: {
        paddingHorizontal: Spacing.lg,
        // 64 (NavBar) + 34 (home indicator) + 24 buffer = 122px clearance
        // for the View All Logs button so it never hugs the plus icon.
        paddingBottom: 122,
    },
    header: {
        marginBottom: Spacing.sm,           // was lg (24) → sm (8)
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: { ...Typography.title } as TextStyle,
    sectionTitle: {
        ...Typography.sectionTitle,
        marginTop: Spacing.md,              // was 24 → 16
        marginBottom: Spacing.sm,           // was 12 → 8
    } as TextStyle,
    actionsGrid: {
        marginTop: Spacing.sm,              // was lg (24) → sm (8)
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: Spacing.md,                 // was lg (24) → md (16)
    },
});
