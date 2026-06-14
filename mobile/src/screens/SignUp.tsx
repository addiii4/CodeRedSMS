import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity, Image, TextStyle, Alert, ScrollView,
    KeyboardAvoidingView, Platform,
} from 'react-native';
import Colors from '../constants/color';
import Spacing from '../constants/spacing';
import Typography from '../constants/typography';
import useAppNavigation from '../hooks/useAppNavigation';
import { useAuth } from '../state/auth';

type Mode = 'join' | 'create';

export default function SignupScreen() {
    const navigation = useAppNavigation();
    const { register, ready } = useAuth();

    const [mode, setMode] = useState<Mode>('join');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [buildingCode, setBuildingCode] = useState('');
    const [orgName, setOrgName] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSignup = async () => {
        if (!fullName || !email || !buildingCode || !password || !confirm) {
            Alert.alert('Missing info', 'Please fill all fields.');
            return;
        }
        if (mode === 'create' && !orgName.trim()) {
            Alert.alert('Missing info', 'Organisation name is required.');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Weak password', 'Password must be at least 6 characters.');
            return;
        }
        if (password !== confirm) {
            Alert.alert('Passwords do not match', 'Please re-enter.');
            return;
        }

        try {
            setSubmitting(true);
            if (mode === 'create') {
                await register({
                    mode: 'create',
                    email: email.trim().toLowerCase(),
                    password,
                    displayName: fullName.trim(),
                    buildingCode: buildingCode.trim().toUpperCase(),
                    orgName: orgName.trim(),
                });
            } else {
                await register({
                    mode: 'join',
                    email: email.trim().toLowerCase(),
                    password,
                    displayName: fullName.trim(),
                    buildingCode: buildingCode.trim().toUpperCase(),
                });
            }
            // Splash routes pending users to PendingApproval, active to Dashboard.
            navigation.reset({ index: 0, routes: [{ name: 'Splash' }] });
        } catch (e: any) {
            Alert.alert('Sign up failed', e?.message || 'Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={{ paddingBottom: Spacing.margin }} keyboardShouldPersistTaps="handled">
                <View style={styles.top}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.backText}>←</Text>
                    </TouchableOpacity>
                    <View style={styles.centerHeader}>
                        <Image source={require('../../src/assets/logo.png')} style={styles.logo} resizeMode="contain" />
                        <Text style={styles.headerText}>Sign Up</Text>
                    </View>
                </View>

                <View style={styles.form}>
                    <View style={styles.modeToggle}>
                        <TouchableOpacity
                            onPress={() => setMode('join')}
                            style={[styles.modeButton, mode === 'join' && styles.modeButtonActive]}
                        >
                            <Text style={[styles.modeText, mode === 'join' && styles.modeTextActive]}>Join existing</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setMode('create')}
                            style={[styles.modeButton, mode === 'create' && styles.modeButtonActive]}
                        >
                            <Text style={[styles.modeText, mode === 'create' && styles.modeTextActive]}>Start new org</Text>
                        </TouchableOpacity>
                    </View>

                    {mode === 'create' && (
                        <View style={styles.warningBox}>
                            <Text style={styles.warningText}>
                                New organisations require approval from the Code Red team before sending messages. Usually within 1 business day.
                            </Text>
                        </View>
                    )}

                    <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor={Colors.greyStroke} value={fullName} onChangeText={setFullName} />
                    <TextInput style={styles.input} placeholder="Email Address" placeholderTextColor={Colors.greyStroke} autoCapitalize="none" value={email} onChangeText={setEmail} keyboardType="email-address" />
                    {mode === 'create' && (
                        <TextInput style={styles.input} placeholder="Organisation Name" placeholderTextColor={Colors.greyStroke} value={orgName} onChangeText={setOrgName} />
                    )}
                    <TextInput style={styles.input} placeholder={mode === 'join' ? 'Building Code (e.g. RED123)' : 'Choose a Building Code'} placeholderTextColor={Colors.greyStroke} autoCapitalize="characters" value={buildingCode} onChangeText={setBuildingCode} />
                    <TextInput style={styles.input} placeholder="Create Password (min 6 chars)" placeholderTextColor={Colors.greyStroke} value={password} onChangeText={setPassword} secureTextEntry />
                    <TextInput style={styles.input} placeholder="Confirm Password" placeholderTextColor={Colors.greyStroke} value={confirm} onChangeText={setConfirm} secureTextEntry />

                    <TouchableOpacity
                        style={[styles.button, (submitting || !ready) && { opacity: 0.6 }]}
                        onPress={handleSignup}
                        disabled={submitting || !ready}>
                        <Text style={styles.buttonText}>
                            {submitting ? 'Submitting…' : mode === 'create' ? 'Request Organisation' : 'Create Account'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: Spacing.lg },
    top: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.margin },
    backText: { fontSize: 24, color: Colors.primary } as TextStyle,
    centerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1, marginRight: 24 },
    logo: { width: 48, height: 48, marginRight: Spacing.sm },
    headerText: { ...Typography.title, color: Colors.text } as TextStyle,
    form: { paddingTop: Spacing.lg, paddingHorizontal: Spacing.lg, justifyContent: 'center' },
    modeToggle: { flexDirection: 'row', backgroundColor: '#EEE', borderRadius: 10, padding: 4, marginBottom: Spacing.lg },
    modeButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
    modeButtonActive: { backgroundColor: '#FFF' },
    modeText: { ...Typography.caption, color: '#888', fontWeight: '600' } as TextStyle,
    modeTextActive: { color: Colors.text } as TextStyle,
    warningBox: { backgroundColor: '#FFF8E1', borderColor: '#FFD54F', borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: Spacing.lg },
    warningText: { ...Typography.caption, color: '#7A5A00' } as TextStyle,
    input: {
        height: 56, borderWidth: 1, borderColor: Colors.greyStroke, borderRadius: 12,
        paddingHorizontal: Spacing.md, marginBottom: Spacing.lg,
        ...Typography.body, backgroundColor: '#FFFFFF',
    } as TextStyle,
    button: { backgroundColor: Colors.primary, paddingVertical: Spacing.md, borderRadius: 12, alignItems: 'center' },
    buttonText: { fontSize: 17, fontWeight: '600', color: '#FFFFFF' } as TextStyle,
});
