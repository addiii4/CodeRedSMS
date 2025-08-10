import React from 'react';
import { View, Text, StyleSheet, Pressable, TextStyle } from 'react-native';
import color from '../constants/color';
import spacing from '../constants/spacing';
import typography from '../constants/typography';

type Props = {
    brand?: 'visa' | 'mastercard' | 'amex' | 'generic';
    last4?: string;
    onChange?: () => void;
};

export default function PaymentMethodCard({ brand = 'visa', last4 = '4242', onChange }: Props) {
    const brandText = brand.toUpperCase();

    return (
        <View style={styles.card}>
            <View style={styles.row}>
                <View style={styles.brandPill}>
                    <Text style={styles.brandText}>{brandText}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.title}>Payment Method</Text>
                    <Text style={styles.meta}>Card ending •••• {last4}</Text>
                </View>
                {!!onChange && (
                    <Pressable onPress={onChange}>
                        <Text style={styles.change}>Change</Text>
                    </Pressable>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#00000012',
        padding: spacing.md
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    brandPill: {
        paddingHorizontal: spacing.md,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: '#F4F4F4',
        borderWidth: 1,
        borderColor: '#00000010'
    },
    brandText: { ...typography.label, color: color.text } as TextStyle,
    title: { ...typography.body } as TextStyle,
    meta: { ...typography.label, color: '#8E8E8E' } as TextStyle,
    change: { ...typography.label, color: color.primary, fontWeight: 600 } as TextStyle
});