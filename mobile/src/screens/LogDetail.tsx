import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextStyle } from 'react-native';
import HeaderBack from '../components/HeaderBack';
import NavBar from '../components/NavBar';
import spacing from '../constants/spacing';
import color from '../constants/color';
import typography from '../constants/typography';
import useAppNavigation from '../hooks/useAppNavigation';

export default function LogDetail() {
    const navigation = useAppNavigation();

    const data = {
        title: 'Fire Alarm – Evacuate Now',
        body: 'Please proceed to the nearest exit and assemble at the designated area.',
        status: 'Delivered',
        sentAt: 'Today 09:24',
        recipients: 160,
        creditsUsed: 1,
        breakdown: [
            { label: 'Delivered', value: 154 },
            { label: 'Failed', value: 4 },
            { label: 'Pending', value: 2 }
        ]
    };

    return (
        <View style={styles.container}>
            <HeaderBack title="Message" />
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.meta}>Title</Text>
                    <Text style={styles.body}>{data.title}</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.meta}>Message</Text>
                    <Text style={styles.body}>{data.body}</Text>
                </View>

                <View style={styles.rowCard}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.meta}>Status</Text>
                        <Text style={styles.body}>{data.status}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.meta}>Sent</Text>
                        <Text style={styles.body}>{data.sentAt}</Text>
                    </View>
                </View>

                <View style={styles.rowCard}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.meta}>Recipients</Text>
                        <Text style={styles.body}>{data.recipients}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.meta}>Credits</Text>
                        <Text style={styles.body}>{data.creditsUsed}</Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.meta}>Delivery Breakdown</Text>
                    {data.breakdown.map((b) => (
                        <View key={b.label} style={styles.breakRow}>
                            <Text style={styles.breakLabel}>{b.label}</Text>
                            <Text style={styles.breakVal}>{b.value}</Text>
                        </View>
                    ))}
                </View>

                <View style={{ height: spacing.margin }} />
            </ScrollView>

            <NavBar
                activeTab="home"
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
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#00000012',
        padding: spacing.md,
        marginBottom: spacing.md
    },
    rowCard: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
    meta: { ...typography.label, color: '#8E8E8E', marginBottom: 4 } as TextStyle,
    body: { ...typography.body } as TextStyle,
    breakRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: '#00000010'
    },
    breakLabel: { ...typography.body } as TextStyle,
    breakVal: { ...typography.body } as TextStyle
});