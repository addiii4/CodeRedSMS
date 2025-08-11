//filters for Logs
import React from 'react';
import { Pressable, Text, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import color from '../constants/color';
import spacing from '../constants/spacing';
import typography from '../constants/typography';

type Props = {
    label: string;
    active?: boolean;
    style?: ViewStyle;
    onPress: () => void;
};

export default function Chip({ label, active, onPress, style }: Props) {
    return (
        <Pressable onPress={onPress} style={[styles.base, active ? styles.active : styles.inactive, style]}>
            <Text style={[styles.txt, active && styles.txtActive]}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        height: 32,
        paddingHorizontal: spacing.md,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1
    },
    inactive: {
        backgroundColor: '#FFFFFF',
        borderColor: '#00000012'
    },
    active: {
        backgroundColor: color.primary,
        borderColor: color.primary
    },
    txt: {
        ...typography.label,
        color: '#777777'
    } as TextStyle,
    txtActive: {
        color: '#FFFFFF',
        fontWeight: 600
    } as TextStyle
});