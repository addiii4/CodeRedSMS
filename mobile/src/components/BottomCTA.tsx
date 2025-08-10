//sticky bottom button
import React from 'react';
import { View, Pressable, Text, StyleSheet, TextStyle } from 'react-native';
import color from '../constants/color';
import spacing from '../constants/spacing';
import typography from '../constants/typography';

type Props = {
    label: string;
    onPress: () => void;
};

export default function BottomCTA({ label, onPress }: Props) {
    return (
        <View style={styles.wrap}>
            <Pressable onPress={onPress} style={styles.btn}>
                <Text style={styles.txt}>{label}</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        padding: spacing.md,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#00000010'
    },
    btn: {
        backgroundColor: color.primary,
        borderRadius: 12,
        alignItems: 'center',
        paddingVertical: spacing.md
    },
    txt: {
        ...typography.body,
        color: '#FFFFFF',
        fontWeight: 600
    } as TextStyle
});