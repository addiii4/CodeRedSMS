import React, { useState } from 'react';
import { View, Text, StyleSheet, TextStyle, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import color from '../constants/color';
import spacing from '../constants/spacing';
import typography from '../constants/typography';
import NavBar from '../components/NavBar';
import useAppNavigation from '../hooks/useAppNavigation';
import HeaderBack from '../components/HeaderBack';

const FAQ: { q: string; a: string }[] = [
    {
        q: 'What is a credit?',
        a: 'One credit = one SMS segment (up to 160 characters). Messages longer than 160 characters are split into 153-character segments, each costing one credit. You can see an estimate before sending.',
    },
    {
        q: 'How do I send a message to a group?',
        a: 'Tap the + button on the bottom navigation bar to open Compose. Type your message, then tap "Select Recipients" to choose one or more groups. Review and send or schedule.',
    },
    {
        q: 'Can I schedule a message for later?',
        a: 'Yes. On the Review & Send screen, switch to "Schedule" and pick a date and time. The message will be sent automatically at that time. You can see scheduled messages in Logs.',
    },
    {
        q: 'How do I import contacts?',
        a: 'Go to Settings → Import & Manage. Prepare a CSV file with columns NAME, PHONE NUMBER, and optionally GROUPS. Tap "Choose CSV file" to upload it. Contacts are created instantly and added to any groups you specified.',
    },
    {
        q: 'What CSV format should I use?',
        a: 'Your CSV must have at least two columns: NAME and PHONE NUMBER. Phone numbers should be in international format (e.g. +61400000000). A third optional column GROUPS can list comma-separated group names.',
    },
    {
        q: 'Why is my message not delivered?',
        a: 'Check the Logs screen and tap the message for a delivery breakdown. Common reasons: invalid phone number format, insufficient credits, or the recipient\'s carrier blocking the sender ID.',
    },
    {
        q: 'What is a Sender ID?',
        a: 'The Sender ID is the name that appears instead of a phone number on the recipient\'s phone (e.g. "CodeRed"). It must be 1–11 alphanumeric characters. You can set it in Settings → Org Settings. Note: some countries and carriers do not support custom Sender IDs.',
    },
    {
        q: 'How do I buy more credits?',
        a: 'Go to Settings → Buy Credits or tap the credit badge on the Dashboard. Choose a plan and complete the Stripe checkout. Credits are added instantly after payment.',
    },
    {
        q: 'Who can change organisation settings?',
        a: 'Only users with the Admin role can update the org name and Sender ID. The first user to register with a building code is automatically assigned the Admin role.',
    },
];

function FAQItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <Pressable style={styles.faqItem} onPress={() => setOpen(o => !o)}>
            <View style={styles.faqHeader}>
                <Text style={styles.faqQ}>{q}</Text>
                <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color="#8E8E8E" />
            </View>
            {open && <Text style={styles.faqA}>{a}</Text>}
        </Pressable>
    );
}

export default function HelpCenter() {
    const navigation = useAppNavigation();
    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={{ marginHorizontal: -spacing.lg }}>
                    <HeaderBack title="Help Center" />
                </View>
                <Text style={styles.intro}>Frequently asked questions about Code Red SMS.</Text>
                {FAQ.map((item, i) => <FAQItem key={i} {...item} />)}
                <View style={{ height: spacing.margin }} />
            </ScrollView>
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
    intro: { ...typography.body, color: '#555', marginTop: spacing.md, marginBottom: spacing.md, lineHeight: 22 } as TextStyle,
    faqItem: {
        backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1,
        borderColor: '#00000010', padding: spacing.md, marginBottom: spacing.sm,
    },
    faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    faqQ: { ...typography.body, flex: 1, fontWeight: '600', paddingRight: spacing.sm } as TextStyle,
    faqA: { ...typography.body, color: '#555', marginTop: spacing.sm, lineHeight: 22 } as TextStyle,
});
