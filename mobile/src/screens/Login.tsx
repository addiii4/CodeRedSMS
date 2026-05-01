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
    const { deviceLogin, login, ready } = useAuth();

    const [buildingCode, setBuildingCode] = useState('');
    const [showEmailMode, setShowEmailMode] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Quick login — building code only, uses stored device ID
    const handleQuickLogin = async () => {
        if (!buildingCode.trim()) {
            Alert.alert('Required', 'Please enter your building code.');
            return;
        }
        setLoading(true);
        try {
            await deviceLogin({ buildingCode: buildingCode.trim().toUpperCase() });
            navigation.navigate('Dashboard');
        } catch (e: any) {
            // Device not registered = prompt them to use email login
            if (e?.message?.includes('not registered') || e?.message?.includes('Device')) {
                Alert.alert(
                    'Device not recognised',
                    'This device hasn\'t been set up yet. Sign in with your email and password to link it, or sign up to create a new account.',
                    [
                        { text: 'Sign in with email', onPress: () => setShowEmailMode(true) },
                        { text: 'Cancel', style: 'cancel' },
                    ],
                );
            } else {
                Alert.alert('Login failed', e?.message || 'Please check your building code.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Email login — building code + email + password, also registers device
    const handleEmailLogin = async () => {
        if (!buildingCode.trim() || !email.trim() || !password) {
            Alert.alert('Required', 'Please fill in all fields.');
            return;
        }
        setLoading(true);
        try {
            await login({
                buildingCode: buildingCode.trim().toUpperCase(),
                email: email.trim().toLowerCase(),
                password,
            });
            navigation.navigate('Dashboard');
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
            <ScrollView
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
                bounces={false}
            >
                {/* Top Logo */}
                <View style={styles.top}>
                    <Image
                        source={require('../../src/assets/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.loginText}>Login</Text>
                </View>

                {/* Form */}
                <View style={styles.middle}>
                    {!showEmailMode ? (
                        // ── MODE 1: Quick login ──────────────────────────────
                        <>
                            <Text style={styles.title}>Enter Building Code</Text>
                            <Text style={styles.caption}>
                                Your building code identifies your organisation.
                            </Text>

                            <TextInput
                                style={styles.input}
                                placeholder="e.g. RED123"
                                placeholderTextColor={Colors.greyStroke}
                                value={buildingCode}
                                onChangeText={setBuildingCode}
                                autoCapitalize="characters"
                            />

                            <TouchableOpacity
                                style={[styles.button, loading && styles.buttonDisabled]}
                                onPress={handleQuickLogin}
                                disabled={loading || !ready}
                            >
                                <Text style={styles.buttonText}>
                                    {loading ? 'Signing in…' : 'Continue'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.switchMode}
                                onPress={() => setShowEmailMode(true)}
                            >
                                <Text style={styles.switchModeText}>
                                    Sign in with email & password →
                                </Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        // ── MODE 2: Email + password login ───────────────────
                        <>
                            <Text style={styles.title}>Sign In</Text>
                            <Text style={styles.caption}>
                                Use your email and password to access your account on this device.
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
                                placeholder="Password"
                                placeholderTextColor={Colors.greyStroke}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />

                            <TouchableOpacity
                                style={[styles.button, loading && styles.buttonDisabled]}
                                onPress={handleEmailLogin}
                                disabled={loading || !ready}
                            >
                                <Text style={styles.buttonText}>
                                    {loading ? 'Signing in…' : 'Sign In'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.switchMode}
                                onPress={() => navigation.navigate('ForgotPassword')}
                            >
                                <Text style={styles.switchModeText}>
                                    Forgot password?
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.switchMode}
                                onPress={() => setShowEmailMode(false)}
                            >
                                <Text style={[styles.switchModeText, { color: Colors.greyStroke }]}>
                                    ← Back to building code login
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* Bottom */}
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
    top: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        marginTop: Spacing.margin, paddingHorizontal: Spacing.lg,
    },
    logo: { width: 48, height: 48, marginRight: Spacing.sm },
    loginText: { ...Typography.title, color: Colors.text } as TextStyle,
    middle: { paddingHorizontal: Spacing.lg, justifyContent: 'center', marginTop: Spacing.margin },
    title: { ...Typography.title, marginBottom: Spacing.sm } as TextStyle,
    caption: { ...Typography.caption, marginBottom: Spacing.lg } as TextStyle,
    input: {
        height: 50, borderWidth: 1, borderColor: Colors.greyStroke, borderRadius: 12,
        paddingHorizontal: Spacing.md, marginBottom: Spacing.lg,
        ...Typography.body, backgroundColor: '#FFFFFF',
    } as TextStyle,
    button: {
        backgroundColor: Colors.primary, paddingVertical: Spacing.md,
        borderRadius: 12, alignItems: 'center',
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { fontSize: 17, fontWeight: '600', color: '#FFFFFF' } as TextStyle,
    switchMode: { marginTop: Spacing.lg, alignItems: 'center' },
    switchModeText: { ...Typography.caption, color: Colors.primary, fontWeight: '600' } as TextStyle,
    bottom: { alignItems: 'center', marginBottom: Spacing.margin },
    signupCaption: { ...Typography.caption, color: Colors.greyStroke } as TextStyle,
    signupLink: { color: Colors.primary, fontWeight: '600' },
});
