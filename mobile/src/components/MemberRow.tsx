//group members with remove
import React from 'react';
import { View, Text, StyleSheet, Pressable, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import spacing from '../constants/spacing';
import typography from '../constants/typography';

type Props = {
    name: string;
    secondary?: string;     // e.g., phone or role
    onRemove?: () => void;
};

export default function MemberRow({ name, secondary, onRemove }: Props) {
    return (
        <View style={styles.row}>
            <View style={{ flex: 1 }}>
                <Text style={styles.name}>{name}</Text>
                {!!secondary && <Text style={styles.secondary}>{secondary}</Text>}
            </View>
            {onRemove && (
                <Pressable onPress={onRemove}>
                    <Ionicons name="trash-outline" size={20} color="#A33" />
                </Pressable>
            )}
        </View>
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
    name: { ...typography.body } as TextStyle,
    secondary: { ...typography.label, color: '#8E8E8E' } as TextStyle
});