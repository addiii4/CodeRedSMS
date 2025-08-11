import React from 'react';
import { View, Text, StyleSheet, Pressable, TextStyle } from 'react-native';
import color from '../constants/color';
import spacing from '../constants/spacing';
import typography from '../constants/typography';

type Props = {
    title: string;         // e.g. "Starter"
    credits: number;       // e.g. 500
    price: string;         // e.g. "$49"
    selected?: boolean;
    onPress: () => void;
};

export default function PricingCard({ title, credits, price, selected, onPress }: Props) {
    return (
        <Pressable onPress={onPress} style={[styles.card, selected && styles.selected]}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.credits}>{credits.toLocaleString()} Credits</Text>
            <Text style={styles.price}>{price}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#00000012',
        padding: spacing.md,
        alignItems: 'center'
    },
    selected: {
        borderColor: color.primary
    },
    title: {
        ...typography.label,
        color: '#8E8E8E',
        marginBottom: spacing.sm
    } as TextStyle,
    credits: {
        ...typography.body,
        marginBottom: spacing.sm
    } as TextStyle,
    price: {
        ...typography.body,
        color: color.primary,
        fontWeight: 700
    } as TextStyle
});