import React from 'react';
import { View, Text, StyleSheet, TextStyle } from 'react-native';
import color from '../constants/colors';
import spacing from '../constants/spacing';
import typography from '../constants/typography';

type Props = { credits: number };

export default function CreditsBadge({ credits }: Props) {
    return (
        <View style={styles.badge}>
            <Text style={styles.text}>{credits} Credits</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        backgroundColor: color.primary,
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
        borderRadius: 999,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 2
    },
    text: {
        ...typography.label,
        color: '#FFFFFF',
        fontWeight: 600
    } as TextStyle
});