//group selection
import React from 'react';
import { View, Text, StyleSheet, Pressable, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import spacing from '../constants/spacing';
import typography from '../constants/typography';
import color from '../constants/colors';

type Props = {
    label: string;
    count?: number;
    checked: boolean;
    onToggle: () => void;
};

export default function CheckboxRow({ label, count, checked, onToggle }: Props) {
    return (
        <Pressable onPress={onToggle} style={styles.row}>
            <View style={[styles.box, checked && styles.boxChecked]}>
                {checked && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <Text style={styles.label}>{label}</Text>
            {!!count && <Text style={styles.count}>{count}</Text>}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#00000010'
    },
    box: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: color.greyStroke,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
        backgroundColor: '#FFFFFF'
    },
    boxChecked: {
        backgroundColor: color.primary,
        borderColor: color.primary
    },
    label: {
        ...typography.body,
        flex: 1
    } as TextStyle,
    count: {
        ...typography.label,
        color: '#8E8E8E'
    } as TextStyle
});