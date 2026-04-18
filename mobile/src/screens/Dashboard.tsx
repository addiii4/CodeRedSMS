import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Image,
    TextStyle,
    Alert
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Colors from '../constants/color';
import Spacing from '../constants/spacing';
import Typography from '../constants/typography';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import SecTitle from '../components/SecTitle';
import CreditsBadge from '../components/CreditsBadge';
import ActivityCard from '../components/ActivityCard';
import PrimaryButton from '../components/PrimaryButton';
import QuickActionButton from '../components/QuickActionButton';
import NavBar from '../components/NavBar';
import useAppNavigation from '../hooks/useAppNavigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { messagesApi } from '../services/messages';
import { paymentsApi } from '../services/payments';
import { PREF_LOW_CREDIT_ALERTS } from './Settings';

const LOW_CREDIT_THRESHOLD = 20;
// Module-level: alert fires at most once per app session, not on every navigation.
let lowCreditAlertShownThisSession = false;

export default function Dashboard() {
    const navigation = useAppNavigation();

    type DashboardLogItem = {
        id: string;
        title: string;
        status: string;
        createdAt: string;
        scheduledAt: string | null;
    };

    const [recentLogs, setRecentLogs] = useState<DashboardLogItem[]>([]);
    const [credits, setCredits] = useState(0);

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
                            `You have ${res.credits} credit${res.credits === 1 ? '' : 's'} remaining. Buy more to keep sending messages.`,
                            [{ text: 'Buy Credits', onPress: () => navigation.navigate('BuyCredits') }, { text: 'Dismiss' }]
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

            const load = async () => {
            try {
                const res = await messagesApi.list();
                if (active) {
                setRecentLogs(res.items.slice(0, 3));
                }
            } catch (e) {
                console.error('Dashboard logs load error:', e);
            }
            };

            load();

            return () => {
            active = false;
            };
        }, []),
    );

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <SafeAreaView edges={['top']} style={{ paddingTop: Spacing.md }}>
                    <View style={styles.header}>
                        <Text style={styles.title as any}>Dashboard</Text>
                        <CreditsBadge credits={credits} onPress={() => navigation.navigate('BuyCredits')} />
                    </View>
                </SafeAreaView>

                <SecTitle text="Recent Activity" />
                {recentLogs.length === 0 ? (
                <ActivityCard text="No recent activity yet" />
                    ) : (
                    recentLogs.map((item) => (
                        <ActivityCard
                        key={item.id}
                        text={`${item.title} | ${item.status} | ${new Date(item.createdAt).toLocaleString()}`}
                        />
                    ))
                )}
                <PrimaryButton label="View All Logs" onPress={() => navigation.navigate('Logs' as never)} />

                <SecTitle text="Quick Actions" />
                <View style={styles.actionsGrid}>
                    <QuickActionButton label="Buy Credits" icon="card-outline" onPress={() => navigation.navigate('BuyCredits')} />
                    <QuickActionButton label="Contacts" icon="people-outline" onPress={() => navigation.navigate('Contacts' as never)} />
                    <QuickActionButton label="Templates" icon="description" lib="mat" onPress={() => navigation.navigate('Templates' as never)} />
                    <QuickActionButton label="Logs" icon="list" lib="mat" onPress={() => navigation.navigate('Logs' as never)} />
                </View>
            </ScrollView>

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
        backgroundColor: Colors.background
    },
    scrollContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xl + 72
    },
    header: {
        marginBottom: Spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    title: {
        ...Typography.title
    } as TextStyle,
    actionsGrid: {
        marginTop: Spacing.lg,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: Spacing.lg
    }
});