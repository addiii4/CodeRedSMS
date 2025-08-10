import React from 'react';
import { View, Text, StyleSheet, TextStyle, Pressable } from 'react-native';
import color from '../constants/color';
import spacing from '../constants/spacing';
import typography from '../constants/typography';

type Props = { credits: number; onPress?: () => void };

export default function CreditsBadge({ credits, onPress }: Props) {
    const Wrapper = onPress ? Pressable : View;
    return (
        <Wrapper onPress={onPress as any} style={styles.badge}>
            <Text style={styles.text}>{credits} Credits</Text>
        </Wrapper>
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