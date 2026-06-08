import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform, Image, TextStyle, Alert, ScrollView,
} from 'react-native';
import useAppNavigation from '../hooks/useAppNavigation';
import Colors from '../constants/color';
import Spacing from '../constants/spacing';
import Typography from '../constants/typography';
import { useAuth } from '../state/auth';

export default function LoginScreen() {
    const navigation = useAppNavigation();
    const { login, ready } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email.trim() || !password) {
            Alert.alert('Required', 'Please enter your email and password.');
            return;
        }
        setLoading(true);
        try {
            await login({ email: email.trim().toLowerCase(), password });
            navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
        } catch (e: any) {
            Alert.alert('Sign in failed', e?.message || 'Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" bounces={false}>
                <View style={styles.top}>
                    <Image source={require('../../src/assets/logo.png')} style={styles.logo} resizeMode="contain" />
                    <Text style={styles.loginText}>Sign In</Text>
                </View>

                <View style={styles.middle}>
                    <Text style={styles.caption}>Welcome back. Sign in with your email.</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor={Colors.greyStroke}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor={Colors.greyStroke}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={loading || !ready}
                    >
                        <Text style={styles.buttonText}>{loading ? 'Signing in…' : 'Sign In'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.switchMode} onPress={() => navigation.navigate('ForgotPassword')}>
                        <Text style={styles.switchModeText}>Forgot password?</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.bottom}>
                    <Text style={styles.signupCaption}>
                        Need an account?{' '}
                        <Text style={styles.signupLink} onPress={() => navigation.navigate('Signup')}>
                            Sign up
                        </Text>
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scroll: { flexGrow: 1, justifyContent: 'space-between', paddingBottom: Spacing.margin },
    top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: Spacing.margin, paddingHorizontal: Spacing.lg },
    logo: { width: 48, height: 48, marginRight: Spacing.sm },
    loginText: { ...Typography.title, color: Colors.text } as TextStyle,
    middle: { paddingHorizontal: Spacing.lg, justifyContent: 'center', marginTop: Spacing.margin },
    caption: { ...Typography.caption, marginBottom: Spacing.lg, textAlign: 'center' } as TextStyle,
    input: {
        height: 50, borderWidth: 1, borderColor: Colors.greyStroke, borderRadius: 12,
        paddingHorizontal: Spacing.md, marginBottom: Spacing.lg,
        ...Typography.body, backgroundColor: '#FFFFFF',
    } as TextStyle,
    button: { backgroundColor: Colors.primary, paddingVertical: Spacing.md, borderRadius: 12, alignItems: 'center' },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { fontSize: 17, fontWeight: '600', color: '#FFFFFF' } as TextStyle,
    switchMode: { marginTop: Spacing.lg, alignItems: 'center' },
    switchModeText: { ...Typography.caption, color: Colors.primary, fontWeight: '600' } as TextStyle,
    bottom: { alignItems: 'center', marginBottom: Spacing.margin },
    signupCaption: { ...Typography.caption, color: Colors.greyStroke } as TextStyle,
    signupLink: { color: Colors.primary, fontWeight: '600' },
});
