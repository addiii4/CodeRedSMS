import React from 'react';
import { View, Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import color from '../constants/colors';
import spacing from '../constants/spacing';
import typography from '../constants/typography';

type Props = {
    segments: string[];
    value: string;
    onChange: (v: string) => void;
    style?: ViewStyle;
};

export default function SegmentedControl({ segments, value, onChange, style }: Props) {
    return (
        <View style={[styles.wrap, style]}>
            {segments.map((s) => {
                const active = s === value;
                return (
                    <Pressable key={s} onPress={() => onChange(s)} style={[styles.seg, active && styles.segActive]}>
                        <Text style={[styles.text, active && styles.textActive]}>{s}</Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        flexDirection: 'row',
        backgroundColor: '#F2F2F2',
        padding: 4,
        borderRadius: 12
    },
    seg: {
        flex: 1,
        height: 36,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center'
    },
    segActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 1
    },
    text: {
        ...typography.label,
        color: '#777777'
    } as TextStyle,
    textActive: {
        color: color.text,
        fontWeight: 600
    } as TextStyle
});