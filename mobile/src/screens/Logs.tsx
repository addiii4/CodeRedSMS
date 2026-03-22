import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextStyle,
} from 'react-native';
import spacing from '../constants/spacing';
import color from '../constants/color';
import typography from '../constants/typography';
import SearchBar from '../components/SearchBar';
import Chip from '../components/Chip';
import ListRow from '../components/ListRow';
import NavBar from '../components/NavBar';
import useAppNavigation from '../hooks/useAppNavigation';
import { messagesApi } from '../services/messages';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';


type LogItem = {
    id: string;
    title: string;
    status: string;
    createdAt: string;
    scheduledAt: string | null;
};

type Filter = 'All' | 'Delivered' | 'Failed' | 'Scheduled';

export default function Logs() {
    const navigation = useAppNavigation();
    const [q, setQ] = useState('');
    const [filter, setFilter] = useState<Filter>('All');
    const [items, setItems] = useState<LogItem[]>([]);

    useFocusEffect(
        useCallback(() => {
            messagesApi
            .list()
            .then((res) => {
                setItems(res.items);
            })
            .catch((e: any) => {
                console.error('Load Logs Error:', e);
            });
        }, []),
    );

    const visibleItems = useMemo(() => {
        const needle = q.trim().toLowerCase();
        return items
        .filter((m) =>
            filter === 'All'
            ? true
            : m.status.toLowerCase() === filter.toLowerCase(),
        )
        .filter((m) => (needle ? m.title.toLowerCase().includes(needle) : true));
    }, [items, q, filter]);

    return (
        <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.header}>Logs</Text>

            <SearchBar value={q} onChangeText={setQ} placeholder="Search logs…" />

            <View style={styles.chips}>
            {(['All', 'Delivered', 'Failed', 'Scheduled'] as Filter[]).map(
                (f) => (
                <Chip
                    key={f}
                    label={f}
                    active={filter === f}
                    onPress={() => setFilter(f)}
                />
                ),
            )}
            </View>

            <View style={{ marginTop: spacing.md }}>
            {visibleItems.map((m) => (
                <ListRow
                key={m.id}
                title={m.title}
                meta={`${m.status} · ${new Date(m.createdAt).toLocaleString()}`}
                onPress={() => navigation.navigate('LogDetail', { id: m.id })}
                />
            ))}
            </View>

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
    container: {
        flex: 1,
        backgroundColor: color.background,
        justifyContent: 'space-between',
    },
    content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
    header: {
        ...typography.title,
        marginTop: spacing.margin,
        marginBottom: spacing.md,
    } as TextStyle,
    chips: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
    });
