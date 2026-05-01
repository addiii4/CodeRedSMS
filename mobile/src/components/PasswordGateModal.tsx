import React, { useState } from 'react';
import {
    Modal, View, Text, TextInput, TouchableOpacity,
    StyleSheet, TextStyle, KeyboardAvoidingView, Platform,
} from 'react-native';
import color from '../constants/color';
import spacing from '../constants/spacing';
import typography from '../constants/typography';
import { api } from '../lib/api';

type Props = {
    visible: boolean;
    title?: string;
    onSuccess: () => void;
    onCancel: () => void;
};

export default function PasswordGateModal({ visible, title = 'Confirm Password', onSuccess, onCancel }: Props) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleConfirm() {
        if (!password) { setError('Please enter your password.'); return; }
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/verify-password', { password });
            setPassword('');
            onSuccess();
        } catch {
            setError('Incorrect password. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    function handleCancel() {
        setPassword('');
        setError('');
        onCancel();
    }

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.overlay}
            >
                <View style={styles.sheet}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>
                        Enter your password to access billing.
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#BDBDBD"
                        secureTextEntry
                        value={password}
                        onChangeText={p => { setPassword(p); setError(''); }}
                        autoFocus
                        returnKeyType="done"
                        onSubmitEditing={handleConfirm}
                    />

                    {!!error && <Text style={styles.error}>{error}</Text>}

                    <TouchableOpacity
                        style={[styles.btn, styles.btnPrimary, loading && { opacity: 0.6 }]}
                        onPress={handleConfirm}
                        disabled={loading}
                    >
                        <Text style={styles.btnPrimaryText}>{loading ? 'Checking…' : 'Confirm'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.btn} onPress={handleCancel}>
                        <Text style={styles.btnCancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.lg,
    },
    sheet: {
        backgroundColor: '#FFFFFF', borderRadius: 16,
        padding: spacing.lg, width: '100%',
    },
    title: { ...typography.title, marginBottom: spacing.sm, textAlign: 'center' } as TextStyle,
    subtitle: { ...typography.body, color: '#555', marginBottom: spacing.lg, textAlign: 'center' } as TextStyle,
    input: {
        height: 50, borderWidth: 1, borderColor: '#D6D6D6', borderRadius: 12,
        paddingHorizontal: spacing.md, ...typography.body,
        backgroundColor: '#FAFAFA', marginBottom: spacing.sm,
    } as TextStyle,
    error: { ...typography.label, color: color.primary, marginBottom: spacing.sm } as TextStyle,
    btn: { paddingVertical: spacing.md, borderRadius: 12, alignItems: 'center', marginTop: spacing.sm },
    btnPrimary: { backgroundColor: color.primary },
    btnPrimaryText: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 } as TextStyle,
    btnCancelText: { ...typography.body, color: '#888' } as TextStyle,
});
