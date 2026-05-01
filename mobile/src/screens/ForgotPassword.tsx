import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform, TextStyle, Alert, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useAppNavigation from '../hooks/useAppNavigation';
import Colors from '../constants/color';
import Spacing from '../constants/spacing';
import Typography from '../constants/typography';
import { api } from '../lib/api';

export default function ForgotPassword() {
    const navigation = useAppNavigation();

    const [buildingCode, setBuildingCode] = useState('');
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (!buildingCode.trim() || !email.trim() || !newPassword || !confirm) {
            Alert.alert('Missing fields', 'Please fill in all fields.');
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert('Weak password', 'Password must be at least 6 characters.');
            return;
        }
        if (newPassword !== confirm) {
            Alert.alert('Passwords do not match', 'Please re-enter your new password.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/forgot-password', {
                buildingCode: buildingCode.trim().toUpperCase(),
                email: email.trim().toLowerCase(),
                newPassword,
            });
            Alert.alert(
                'Password reset',
                'Your password has been updated. You can now log in with your new password.',
                [{ text: 'OK', onPress: () => navigation.goBack() }],
            );
        } catch (e: any) {
            Alert.alert('Reset failed', e?.message || 'Invalid building code or email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
                bounces={false}
            >
                {/* Header */}
                <View style={styles.topRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
                        <Ionicons name="chevron-back" size={24} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.header}>Reset Password</Text>
                    <View style={{ width: 24 }} />
                </View>

                <Text style={styles.caption}>
                    Enter your building code and registered email to set a new password.
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="Building Code (e.g. RED123)"
                    placeholderTextColor={Colors.greyStroke}
                    value={buildingCode}
                    onChangeText={setBuildingCode}
                    autoCapitalize="characters"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor={Colors.greyStroke}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                <TextInput
                    style={styles.input}
                    placeholder="New Password (min 6 characters)"
                    placeholderTextColor={Colors.greyStroke}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                />
                <TextInput
                    style={styles.input}
                    placeholder="Confirm New Password"
                    placeholderTextColor={Colors.greyStroke}
                    value={confirm}
                    onChangeText={setConfirm}
                    secureTextEntry
                />

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleReset}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? 'Resetting…' : 'Reset Password'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scroll: {
        flexGrow: 1,
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.margin,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.margin,
        marginBottom: Spacing.lg,
    },
    back: { width: 24, height: 24, justifyContent: 'center' },
    header: { ...Typography.title, flex: 1, textAlign: 'center' } as TextStyle,
    caption: {
        ...Typography.caption,
        color: Colors.greyStroke,
        marginBottom: Spacing.lg,
        textAlign: 'center',
    } as TextStyle,
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: Colors.greyStroke,
        borderRadius: 12,
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.lg,
        ...Typography.body,
        backgroundColor: '#FFFFFF',
    } as TextStyle,
    button: {
        backgroundColor: Colors.primary,
        paddingVertical: Spacing.md,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { fontSize: 17, fontWeight: '600', color: '#FFFFFF' } as TextStyle,
});
