import React from 'react';
import { View, TextInput, StyleSheet, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import color from '../constants/color';
import spacing from '../constants/spacing';
import typography from '../constants/typography';

type Props = {
    placeholder?: string;
    value: string;
    onChangeText: (t: string) => void;
};

export default function SearchBar({ placeholder = 'Search…', value, onChangeText }: Props) {
    return (
        <View style={styles.wrap}>
            <Ionicons name="search" size={18} color="#999" style={{ marginRight: spacing.sm }} />
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor="#A0A0A0"
                value={value}
                onChangeText={onChangeText}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: color.greyStroke,
        paddingHorizontal: spacing.md,
        height: 44
    },
    input: {
        flex: 1,
        ...typography.body
    } as TextStyle
});