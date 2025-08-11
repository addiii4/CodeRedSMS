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
    rightIcon?: React.ReactNode | null;
    showChevron?: boolean; 
};

export default function ListRow({ title, meta, onPress, rightIcon, showChevron = true }: Props) {
    return (
        <Pressable onPress={onPress} disabled={!onPress} style={styles.row}>
            <View style={{ flex: 1 }}>
                <Text style={styles.title}>{title}</Text>
                {!!meta && <Text style={styles.meta}>{meta}</Text>}
            </View>
            {rightIcon !== null && rightIcon}
            {showChevron && rightIcon === undefined && (
                <Ionicons name="chevron-forward" size={18} color="#BDBDBD" />
            )}
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