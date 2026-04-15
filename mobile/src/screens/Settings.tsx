import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextStyle } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import color from '../constants/color';
import spacing from '../constants/spacing';
import typography from '../constants/typography';
import ListRow from '../components/ListRow';
import ToggleRow from '../components/ToggleRow';
import NavBar from '../components/NavBar';
import CreditsBadge from '../components/CreditsBadge';
import PasswordGateModal from '../components/PasswordGateModal';
import useAppNavigation from '../hooks/useAppNavigation';
import { useAuth } from '../state/auth';
import { paymentsApi } from '../services/payments';

// Storage keys — shared with Dashboard so it can read preferences
export const PREF_DELIVERY_RECEIPTS = 'codered_pref_delivery_receipts';
export const PREF_LOW_CREDIT_ALERTS = 'codered_pref_low_credit_alerts';

type BillingTarget = 'BuyCredits' | 'PurchaseHistory' | null;

export default function Settings() {
    const navigation = useAppNavigation();
    const [deliveryReceipts, setDeliveryReceipts] = useState(true);
    const [lowCreditAlerts, setLowCreditAlerts] = useState(true);
    const [credits, setCredits] = useState<number | null>(null);
    const [billingTarget, setBillingTarget] = useState<BillingTarget>(null);

    const { logout } = useAuth();

    function openBilling(target: BillingTarget) {
        setBillingTarget(target);
    }

    // Load saved preferences on mount
    useEffect(() => {
        SecureStore.getItemAsync(PREF_DELIVERY_RECEIPTS).then(v => {
            if (v !== null) setDeliveryReceipts(v === 'true');
        });
        SecureStore.getItemAsync(PREF_LOW_CREDIT_ALERTS).then(v => {
            if (v !== null) setLowCreditAlerts(v === 'true');
        });
        paymentsApi.balance().then(r => setCredits(r.credits)).catch(() => {});
    }, []);

    // Persist when toggled
    const handleDeliveryReceipts = (val: boolean) => {
        setDeliveryReceipts(val);
        SecureStore.setItemAsync(PREF_DELIVERY_RECEIPTS, String(val));
    };

    const handleLowCreditAlerts = (val: boolean) => {
        setLowCreditAlerts(val);
        SecureStore.setItemAsync(PREF_LOW_CREDIT_ALERTS, String(val));
    };

    const handleSignOut = useCallback(async () => {
        await logout();
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }, [logout, navigation]);

    return (
        <View style={styles.container}>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
                {/* Header */}
                <View style={styles.headerRow}>
                    <Text style={styles.title}>Settings</Text>
                    <CreditsBadge label="Sign out" onPress={handleSignOut} />
                </View>

                {/* Notifications */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Notifications</Text>
                    <ToggleRow
                        label="SMS Delivery Receipts"
                        value={deliveryReceipts}
                        onValueChange={handleDeliveryReceipts}
                    />
                    <Text style={styles.hint}>
                        Show an in-app alert when a sent message is confirmed delivered.
                    </Text>
                    <ToggleRow
                        label="Low Credit Alerts"
                        value={lowCreditAlerts}
                        onValueChange={handleLowCreditAlerts}
                    />
                    <Text style={styles.hint}>
                        Warn you on the dashboard when your credit balance drops below 20.
                    </Text>
                </View>

                {/* Organisation */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Organisation</Text>
                    <ListRow title="Org Settings" onPress={() => navigation.navigate('OrgSettings')} />
                    <ListRow title="Members" onPress={() => navigation.navigate('OrgMembers')} />
                </View>

                {/* Account */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Account</Text>
                    <ListRow title="Profile" onPress={() => navigation.navigate('Profile')} />
                    <ListRow title="Change Password" onPress={() => navigation.navigate('ChangePassword')} />
                </View>

                {/* Contacts */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Contacts</Text>
                    <ListRow title="Import & Manage" onPress={() => navigation.navigate('ContactImport')} />
                </View>

                {/* Billing */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Billing</Text>
                    {credits !== null && (
                        <View style={styles.creditsRow}>
                            <Text style={styles.creditsLabel}>Credits balance</Text>
                            <Text style={styles.creditsValue}>{credits}</Text>
                        </View>
                    )}
                    <ListRow title="Buy Credits" onPress={() => openBilling('BuyCredits')} />
                    <ListRow title="Purchase History" onPress={() => openBilling('PurchaseHistory')} />
                </View>

                {/* Support */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Support</Text>
                    <ListRow title="Help Center" onPress={() => navigation.navigate('HelpCenter')} />
                    <ListRow title="Contact Us" onPress={() => navigation.navigate('ContactUs')} />
                </View>

                <View style={{ height: spacing.margin }} />
            </ScrollView>

            <NavBar
                activeTab="menu"
                onHome={() => navigation.navigate('Dashboard')}
                onCompose={() => navigation.navigate('Compose')}
                onMenu={() => {}}
            />

            <PasswordGateModal
                visible={billingTarget !== null}
                title="Billing Access"
                onSuccess={() => {
                    const dest = billingTarget;
                    setBillingTarget(null);
                    if (dest) navigation.navigate(dest);
                }}
                onCancel={() => setBillingTarget(null)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: color.background },
    content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.margin, marginBottom: spacing.md },
    title: { ...typography.title } as TextStyle,
    section: {
        backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#00000010',
        padding: spacing.md, marginBottom: spacing.md,
    },
    sectionLabel: { ...typography.label, color: '#8E8E8E', marginBottom: spacing.sm } as TextStyle,
    hint: { ...typography.label, color: '#BDBDBD', marginBottom: spacing.sm, marginTop: 2 } as TextStyle,
    creditsRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: spacing.sm, marginBottom: spacing.sm,
        borderBottomWidth: 1, borderBottomColor: '#00000010',
    },
    creditsLabel: { ...typography.body } as TextStyle,
    creditsValue: { ...typography.body, color: color.primary, fontWeight: '600' } as TextStyle,
});
