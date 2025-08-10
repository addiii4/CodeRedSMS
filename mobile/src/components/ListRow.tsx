//for templates, logs, etc.
import React from 'react';
import { View, Text, StyleSheet, Pressable, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import spacing from '../constants/spacing';
import typography from '../constants/typography';
import color from '../constants/color';

type Props = {
    title: string;
    meta?: string;        // e.g., "132 chars" or time
    onPress?: () => void;
    rightIcon?: 'chevron-forward' | 'ellipsis-horizontal' | null;
};

export default function ListRow({ title, meta, onPress, rightIcon = 'chevron-forward' }: Props) {
    return (
        <Pressable onPress={onPress} style={styles.row}>
            <View style={{ flex: 1 }}>
                <Text style={styles.title}>{title}</Text>
                {!!meta && <Text style={styles.meta}>{meta}</Text>}
            </View>
            {rightIcon && <Ionicons name={rightIcon} size={18} color="#999" />}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#00000010',
        marginBottom: spacing.md
    },
    title: {
        ...typography.body
    } as TextStyle,
    meta: {
        ...typography.label,
        color: '#8E8E8E',
        marginTop: 2
    } as TextStyle
});