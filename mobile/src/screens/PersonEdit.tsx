//Add new person
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextStyle } from 'react-native';
import color from '../constants/color';
import spacing from '../constants/spacing';
import typography from '../constants/typography';
import BottomCTA from '../components/BottomCTA';
import NavBar from '../components/NavBar';
import useAppNavigation from '../hooks/useAppNavigation';

export default function PersonEdit() {
    const navigation = useAppNavigation();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('');

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.header}>Add Member</Text>

                <Text style={styles.label}>Full Name</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. Alice Chen"
                    placeholderTextColor={color.greyStroke}
                />

                <Text style={[styles.label, { marginTop: spacing.md }]}>Phone Number</Text>
                <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="+61 400 123 456"
                    keyboardType="phone-pad"
                    placeholderTextColor={color.greyStroke}
                />

                <Text style={[styles.label, { marginTop: spacing.md }]}>Role (optional)</Text>
                <TextInput
                    style={styles.input}
                    value={role}
                    onChangeText={setRole}
                    placeholder="e.g. Fire Warden"
                    placeholderTextColor={color.greyStroke}
                />

                <View style={{ height: spacing.margin }} />
            </View>

            <View style={styles.footer}>
                <BottomCTA label="Save Member" onPress={() => navigation.goBack()} />
                <NavBar
                    activeTab="home"
                    onHome={() => navigation.navigate('Dashboard')}
                    onCompose={() => navigation.navigate('Compose')}
                    onMenu={() => navigation.navigate('Settings')}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: color.background, justifyContent: 'space-between' },
    content: { paddingHorizontal: spacing.lg, marginTop: spacing.margin, paddingBottom: spacing.md },
    header: { ...typography.title, marginBottom: spacing.md } as TextStyle,
    footer: { backgroundColor: color.background },
    label: { ...typography.label, color: color.text } as TextStyle,
    input: {
        height: 50, borderWidth: 1, borderColor: color.greyStroke, borderRadius: 12,
        paddingHorizontal: spacing.md, backgroundColor: '#FFFFFF', marginTop: spacing.sm
    }
});