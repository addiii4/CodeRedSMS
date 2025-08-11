import React from 'react';
import { View, Text, StyleSheet, Switch, TextStyle } from 'react-native';
import spacing from '../constants/spacing';
import typography from '../constants/typography';

type Props = {
    label: string;
    value: boolean;
    onValueChange: (v: boolean) => void;
};

export default function ToggleRow({ label, value, onValueChange }: Props) {
    return (
        <View style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Switch value={value} onValueChange={onValueChange} />
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#00000010'
    },
    label: { ...typography.body } as TextStyle
});