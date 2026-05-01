import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TextStyle, ScrollView, Alert } from 'react-native';
import color from '../constants/color';
import spacing from '../constants/spacing';
import typography from '../constants/typography';
import BottomCTA from '../components/BottomCTA';
import NavBar from '../components/NavBar';
import useAppNavigation from '../hooks/useAppNavigation';
import HeaderBack from '../components/HeaderBack';
import { usersApi } from '../services/users';

export default function ChangePassword() {
    const navigation = useAppNavigation();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [saving, setSaving] = useState(false);

    async function handleUpdate() {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Validation', 'Please fill in all fields.');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Validation', 'New passwords do not match.');
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert('Validation', 'New password must be at least 6 characters.');
            return;
        }
        setSaving(true);
        try {
            await usersApi.changePassword({ currentPassword, newPassword });
            Alert.alert('Success', 'Password updated successfully.');
            navigation.goBack();
        } catch (err: any) {
            const msg = err?.message ?? 'Failed to update password. Please try again.';
            Alert.alert('Error', msg);
        } finally {
            setSaving(false);
        }
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={{ marginHorizontal: -spacing.lg }}>
                    <HeaderBack title="Change Password" />
                </View>
                <Text style={styles.label}>Current Password</Text>
                <TextInput
                    style={styles.input}
                    secureTextEntry
                    placeholder="••••••••"
                    placeholderTextColor="#BDBDBD"
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                />
                <Text style={[styles.label, { marginTop: spacing.md }]}>New Password</Text>
                <TextInput
                    style={styles.input}
                    secureTextEntry
                    placeholder="••••••••"
                    placeholderTextColor="#BDBDBD"
                    value={newPassword}
                    onChangeText={setNewPassword}
                />
                <Text style={[styles.label, { marginTop: spacing.md }]}>Confirm New Password</Text>
                <TextInput
                    style={styles.input}
                    secureTextEntry
                    placeholder="••••••••"
                    placeholderTextColor="#BDBDBD"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />
                <View style={{ height: spacing.margin }} />
            </ScrollView>
            <BottomCTA label={saving ? 'Updating…' : 'Update Password'} onPress={handleUpdate} />
            <NavBar onHome={() => navigation.navigate('Dashboard')} onCompose={() => navigation.navigate('Compose')} onMenu={() => navigation.navigate('Settings')} />
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
    },
});
