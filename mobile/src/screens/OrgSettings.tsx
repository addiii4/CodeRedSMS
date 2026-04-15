import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TextStyle, ScrollView, Alert } from 'react-native';
import color from '../constants/color';
import spacing from '../constants/spacing';
import typography from '../constants/typography';
import BottomCTA from '../components/BottomCTA';
import NavBar from '../components/NavBar';
import useAppNavigation from '../hooks/useAppNavigation';
import HeaderBack from '../components/HeaderBack';
import { orgsApi } from '../services/orgs';

export default function OrgSettings() {
    const navigation = useAppNavigation();
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [senderId, setSenderId] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        orgsApi.getOrg().then(org => {
            setName(org.name);
            setCode(org.code);
            setSenderId(org.senderId ?? '');
        }).catch(() => {});
    }, []);

    async function handleSave() {
        if (!name.trim()) {
            Alert.alert('Validation', 'Organisation name cannot be empty.');
            return;
        }
        setSaving(true);
        try {
            await orgsApi.updateOrg({ name: name.trim(), senderId: senderId.trim() || undefined });
            Alert.alert('Saved', 'Organisation settings updated.');
            navigation.goBack();
        } catch (err: any) {
            const msg = err?.message?.includes('403') || err?.message?.toLowerCase().includes('forbidden')
                ? 'Only admins can update organisation settings.'
                : 'Failed to save. Please try again.';
            Alert.alert('Error', msg);
        } finally {
            setSaving(false);
        }
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={{ marginHorizontal: -spacing.lg }}>
                    <HeaderBack title="Organisation Settings" />
                </View>
                <Text style={styles.label}>Organisation Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. Sunrise Halls"
                    placeholderTextColor="#BDBDBD"
                    value={name}
                    onChangeText={setName}
                />
                <Text style={[styles.label, { marginTop: spacing.md }]}>Building Code</Text>
                <TextInput
                    style={[styles.input, styles.inputDisabled]}
                    value={code}
                    editable={false}
                    placeholderTextColor="#BDBDBD"
                />
                <Text style={[styles.label, { marginTop: spacing.md }]}>Sender ID</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. CodeRed (max 11 chars)"
                    placeholderTextColor="#BDBDBD"
                    value={senderId}
                    onChangeText={setSenderId}
                    maxLength={11}
                    autoCapitalize="none"
                />
                <View style={{ height: spacing.margin }} />
            </ScrollView>
            <BottomCTA label={saving ? 'Saving…' : 'Save'} onPress={handleSave} />
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
        paddingHorizontal: spacing.md, backgroundColor: '#FFFFFF', marginTop: spacing.sm,
    },
    inputDisabled: { backgroundColor: '#F5F5F5', color: '#9E9E9E' },
});
