import React from 'react';
import { View, Text, StyleSheet, Pressable, TextStyle } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import color from '../constants/colors';
import spacing from '../constants/spacing';
import typography from '../constants/typography';

type IconLib = 'ion' | 'mat';
type Props = {
    label: string;
    icon: string;          // e.g. 'add', 'people-outline', 'description', 'list'
    lib?: IconLib;         // default 'ion'
    onPress: () => void;
};

export default function QuickActionButton({ label, icon, lib = 'ion', onPress }: Props) {
    return (
        <Pressable style={styles.item} onPress={onPress}>
            <View style={styles.circle}>
                {lib === 'ion'
                    ? <Ionicons name={icon as any} size={24} color={color.text} />
                    : <MaterialIcons name={icon as any} size={24} color={color.text} />
                }
            </View>
            <Text style={styles.label}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    item: {
        alignItems: 'center',
        width: '48%',
        marginBottom: spacing.lg
    },
    circle: {
        backgroundColor: '#FCE8EB',
        padding: spacing.lg,
        borderRadius: 999,
        marginBottom: spacing.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 1
    },
    label: {
        ...typography.label
    } as TextStyle
});