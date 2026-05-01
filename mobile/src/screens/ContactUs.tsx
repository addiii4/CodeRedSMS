import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TextStyle,
    ScrollView, Alert, Linking,
} from 'react-native';
import color from '../constants/color';
import spacing from '../constants/spacing';
import typography from '../constants/typography';
import BottomCTA from '../components/BottomCTA';
import NavBar from '../components/NavBar';
import useAppNavigation from '../hooks/useAppNavigation';
import HeaderBack from '../components/HeaderBack';

// ─── SUPPORT EMAIL ────────────────────────────────────────────────────────────
// Change this one constant when you move to a dedicated support address.
const SUPPORT_EMAIL = 'adityacheema4@gmail.com';
// ─────────────────────────────────────────────────────────────────────────────

export default function ContactUs() {
    const navigation = useAppNavigation();
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    async function handleSend() {
        if (!subject.trim()) {
            Alert.alert('Required', 'Please enter a subject.');
            return;
        }
        if (!message.trim()) {
            Alert.alert('Required', 'Please enter a message.');
            return;
        }

        setSending(true);
        const uri =
            `mailto:${SUPPORT_EMAIL}` +
            `?subject=${encodeURIComponent(subject.trim())}` +
            `&body=${encodeURIComponent(message.trim())}`;

        try {
            const supported = await Linking.canOpenURL(uri);
            if (!supported) {
                Alert.alert(
                    'No mail app found',
                    `Please email us directly at:\n${SUPPORT_EMAIL}`,
                );
                return;
            }
            await Linking.openURL(uri);
            // Reset form after opening mail client
            setSubject('');
            setMessage('');
        } catch {
            Alert.alert('Error', 'Could not open mail app. Please try again.');
        } finally {
            setSending(false);
        }
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <View style={{ marginHorizontal: -spacing.lg }}>
                    <HeaderBack title="Contact Us" />
                </View>

                <Text style={styles.intro}>
                    Have a question or issue? Fill in the form below and we'll get back to you as soon as possible.
                </Text>

                <Text style={styles.label}>Subject</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. Issue with sending messages"
                    placeholderTextColor="#BDBDBD"
                    value={subject}
                    onChangeText={setSubject}
                    returnKeyType="next"
                />

                <Text style={[styles.label, { marginTop: spacing.md }]}>Message</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Describe your issue or question…"
                    placeholderTextColor="#BDBDBD"
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                />

                <Text style={styles.hint}>
                    Tapping Send will open your mail app with this message pre-filled.{'\n'}
                    Sending to: {SUPPORT_EMAIL}
                </Text>

                <View style={{ height: spacing.margin }} />
            </ScrollView>

            <BottomCTA label={sending ? 'Opening…' : 'Send Message'} onPress={handleSend} />
            <NavBar
                onHome={() => navigation.navigate('Dashboard')}
                onCompose={() => navigation.navigate('Compose')}
                onMenu={() => navigation.navigate('Settings')}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: color.background },
    content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
    intro: { ...typography.body, color: '#555', marginTop: spacing.md, marginBottom: spacing.lg, lineHeight: 22 } as TextStyle,
    label: { ...typography.label, color: color.text } as TextStyle,
    input: {
        borderWidth: 1, borderColor: color.greyStroke, borderRadius: 12,
        paddingHorizontal: spacing.md, backgroundColor: '#FFFFFF',
        marginTop: spacing.sm, height: 50,
        ...typography.body,
    },
    textArea: { height: 140, paddingTop: spacing.md },
    hint: { ...typography.label, color: '#BDBDBD', marginTop: spacing.md, lineHeight: 18 } as TextStyle,
});
