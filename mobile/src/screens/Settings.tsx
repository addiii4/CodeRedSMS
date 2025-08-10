import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextStyle } from 'react-native';
import color from '../constants/color';
import spacing from '../constants/spacing';
import typography from '../constants/typography';
import NavBar from '../components/NavBar';
import useAppNavigation from '../hooks/useAppNavigation';

export default function Settings() {
    const navigation = useAppNavigation();

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Header */}
                <Text style={styles.title}>Settings</Text>

                {/* Body */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Account</Text>
                    <Text style={styles.row}>Profile</Text>
                    <Text style={styles.row}>Change Password</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Notifications</Text>
                    <Text style={styles.row}>SMS Delivery Receipts</Text>
                    <Text style={styles.row}>Low Credit Alerts</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Billing</Text>
                    <Text style={styles.row}>Payment Methods</Text>
                    <Text style={styles.row}>Purchase History</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Support</Text>
                    <Text style={styles.row}>Help Center</Text>
                    <Text style={styles.row}>Contact Us</Text>
                </View>

                {/* Spacer so content doesn't hide behind CTA/nav if you add buttons later */}
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
    container: {
        flex: 1,
        backgroundColor: color.background,
        justifyContent: 'space-between'
    },
    content: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md
    },
    title: {
        ...typography.title,
        marginTop: spacing.margin,
        marginBottom: spacing.md
    } as TextStyle,
    section: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#00000010',
        padding: spacing.md,
        marginBottom: spacing.md
    },
    sectionLabel: {
        ...typography.label,
        color: '#8E8E8E',
        marginBottom: spacing.sm
    } as TextStyle,
    row: {
        ...typography.body,
        paddingVertical: spacing.sm
    } as TextStyle
});