// src/screens/Profile.tsx
import React from 'react';
import { View, Text, StyleSheet, TextInput, TextStyle, ScrollView } from 'react-native';
import color from '../constants/color';
import spacing from '../constants/spacing';
import typography from '../constants/typography';
import BottomCTA from '../components/BottomCTA';
import NavBar from '../components/NavBar';
import useAppNavigation from '../hooks/useAppNavigation';
import HeaderBack from '../components/HeaderBack';

export default function Profile() {
    const navigation = useAppNavigation();
    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={{ marginHorizontal: -spacing.lg }}>
                    <HeaderBack title="Profile" />
                </View>
                <Text style={styles.label}>Full Name</Text>
                <TextInput style={styles.input} placeholder="Your name" placeholderTextColor="#BDBDBD" />
                <Text style={[styles.label, { marginTop: spacing.md }]}>Email</Text>
                <TextInput style={styles.input} placeholder="you@example.com" placeholderTextColor="#BDBDBD" />
                <View style={{ height: spacing.margin }} />
            </ScrollView>
            <BottomCTA label="Save" onPress={() => navigation.goBack()} />
            <NavBar onHome={() => navigation.navigate('Dashboard')} onCompose={() => navigation.navigate('Compose')} onMenu={() => navigation.navigate('Settings')}  />
        </View>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: color.background },
    content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
    title: { ...typography.title, marginBottom: spacing.md } as TextStyle,
    label: { ...typography.label, color: color.text } as TextStyle,
    input: {
        height: 50, borderWidth: 1, borderColor: color.greyStroke, borderRadius: 12,
        paddingHorizontal: spacing.md, backgroundColor: '#FFFFFF', marginTop: spacing.sm
    }
});