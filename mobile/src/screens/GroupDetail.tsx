import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import spacing from '../constants/spacing';
import color from '../constants/color';
import typography from '../constants/typography';
import MemberRow from '../components/MemberRow';
import BottomCTA from '../components/BottomCTA';
import NavBar from '../components/NavBar';
import useAppNavigation from '../hooks/useAppNavigation';

export default function GroupDetail() {
    const navigation = useAppNavigation();

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.topRow}>
                    <Pressable onPress={() => navigation.goBack()} style={styles.back}>
                        <Ionicons name="chevron-back" size={24} color={color.text} />
                    </Pressable>
                    <Text style={styles.header}>Maintenance Staff</Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={styles.card}>
                    <Text style={styles.meta}>Members</Text>
                    <MemberRow name="Alice Chen" secondary="+61 400 123 456" onRemove={() => {}} />
                    <MemberRow name="Ben Singh" secondary="+61 400 987 654" onRemove={() => {}} />
                    <MemberRow name="Chris Walker" secondary="+61 400 222 333" onRemove={() => {}} />
                </View>

                <View style={{ height: spacing.margin }} />
            </ScrollView>

            <BottomCTA label="Add Member" onPress={() => navigation.navigate('PersonEdit')} />

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
    container: { flex: 1, backgroundColor: color.background, justifyContent: 'space-between' },
    content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
    topRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.margin, marginBottom: spacing.md },
    back: { width: 24, height: 24, justifyContent: 'center', marginRight: spacing.sm },
    header: { ...typography.title, flex: 1 } as TextStyle,
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#00000010',
        padding: spacing.md
    },
    meta: { ...typography.label, color: '#8E8E8E', marginBottom: spacing.sm } as TextStyle
});