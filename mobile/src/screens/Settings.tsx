import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextStyle } from 'react-native';
import color from '../constants/color';
import spacing from '../constants/spacing';
import typography from '../constants/typography';
import ListRow from '../components/ListRow';
import ToggleRow from '../components/ToggleRow';
import NavBar from '../components/NavBar';
import CreditsBadge from '../components/CreditsBadge';
import useAppNavigation from '../hooks/useAppNavigation';

export default function Settings() {
    const navigation = useAppNavigation();
    const [deliveryReceipts, setDeliveryReceipts] = useState(true);
    const [lowCreditAlerts, setLowCreditAlerts] = useState(true);

    const handleSignOut = () => {
        // TODO: clear auth state, tokens, and reset navigation
        // navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    };

    return (
        <View style={styles.container}>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
                {/* Header row with Sign out pill */}
                <View style={styles.headerRow}>
                    <Text style={styles.title}>Settings</Text>
                    <CreditsBadge label="Sign out" onPress={handleSignOut} />
                </View>

                {/* Notifications (inline toggles) */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Notifications</Text>
                    <ToggleRow label="SMS Delivery Receipts" value={deliveryReceipts} onValueChange={setDeliveryReceipts} />
                    <ToggleRow label="Low Credit Alerts" value={lowCreditAlerts} onValueChange={setLowCreditAlerts} />
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
                    <ListRow title="Payment Methods" onPress={() => navigation.navigate('PaymentMethods')} />
                    <ListRow title="Purchase History" onPress={() => navigation.navigate('PurchaseHistory')} />
                </View>

                {/* Support */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Support</Text>
                    <ListRow title="Help Center" onPress={() => navigation.navigate('HelpCenter')} />
                    <ListRow title="Contact Us" onPress={() => navigation.navigate('ContactUs')} />
                </View>

                {/* make sure last items can scroll above navbar */}
                <View style={{ height: spacing.margin }} />
            </ScrollView>

            <NavBar
                activeTab="menu"
                onHome={() => navigation.navigate('Dashboard')}
                onCompose={() => navigation.navigate('Compose')}
                onMenu={() => {}}
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
        padding: spacing.md, marginBottom: spacing.md
    },
    sectionLabel: { ...typography.label, color: '#8E8E8E', marginBottom: spacing.sm } as TextStyle
});