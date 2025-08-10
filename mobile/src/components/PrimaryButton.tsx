import React from 'react';
import { Text, Pressable, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import color from '../constants/color';
import spacing from '../constants/spacing';
import typography from '../constants/typography';

type Props = {
    label: string;
    onPress: () => void;
    variant?: 'pill' | 'full';
    style?: ViewStyle;
};

export default function PrimaryButton({ label, onPress, variant = 'pill', style }: Props) {
    return (
        <Pressable onPress={onPress} style={[styles.base, variant === 'pill' ? styles.pill : styles.full, style]}>
            <Text style={styles.text}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        backgroundColor: color.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 2
    },
    pill: {
        paddingVertical: 8,
        paddingHorizontal: spacing.xl,
        borderRadius: 999,
        alignSelf: 'center'
    },
    full: {
        paddingVertical: spacing.md,
        borderRadius: 12,
        width: '100%'
    },
    text: {
        ...typography.label,
        color: '#FFFFFF',
        fontWeight: 600
    } as TextStyle
});