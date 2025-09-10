import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextStyle, Alert } from 'react-native';
import HeaderBack from '../components/HeaderBack';
import NavBar from '../components/NavBar';
import spacing from '../constants/spacing';
import color from '../constants/color';
import typography from '../constants/typography';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../constants/types';
import useAppNavigation from '../hooks/useAppNavigation';import { messagesApi } from '../services/messages';

type R = RouteProp<RootStackParamList, 'LogDetail'>;

export default function LogDetail() {
    const navigation = useAppNavigation();
    const route = useRoute<R>();
    const id = route.params?.id;

    const [data, setData] = useState<{
        title: string;
        body: string;
        status: string;
        recipients: number;
        createdAt: string;
        scheduledAt: string | null;
        breakdown: Record<string, number>;
    } | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await messagesApi.get(id);
                setData(res);
            } catch (e: any) {
                Alert.alert('Error', e.message);
            }
        })();
    }, [id]);

        return (
        <View style={styles.container}>
            <HeaderBack title="Message" />
            <ScrollView contentContainerStyle={styles.content}>
                {!data ? (
                    <Text style={styles.body}>Loading…</Text>
                ) : (
                    <>
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
                                <Text style={styles.meta}>Recipients</Text>
                                <Text style={styles.body}>{data.recipients}</Text>
                            </View>
                        </View>
                        <View style={styles.card}>
                            <Text style={styles.meta}>Delivery Breakdown</Text>
                            {Object.entries(data.breakdown).map(([k, v]) => (
                                <View key={k} style={styles.breakRow}>
                                    <Text style={styles.breakLabel}>{k}</Text>
                                    <Text style={styles.breakVal}>{v}</Text>
                                </View>
                            ))}
                        </View>
                        <View style={{ height: spacing.margin }} />
                    </>
                )}
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