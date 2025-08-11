import React from 'react';
import { View, Text, StyleSheet, Pressable, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import spacing from '../constants/spacing';
import typography from '../constants/typography';
import color from '../constants/color';
import useAppNavigation from '../hooks/useAppNavigation';

type Props = { title: string; right?: React.ReactNode };

export default function HeaderBack({ title, right }: Props) {
    const navigation = useAppNavigation();

    return (
        <View style={styles.row}>
            <Pressable
                onPress={() => navigation.goBack()}
                style={styles.back}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Ionicons name="chevron-back" size={24} color={color.text} />
            </Pressable>

            <Text style={styles.title} numberOfLines={1}>
                {title}
            </Text>

            {/* keep layout stable if you pass a right node (optional) */}
            <View style={{ minWidth: 24, alignItems: 'flex-end' }}>{right}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.margin,          // same top rhythm as other pages
        marginBottom: spacing.md,
        paddingHorizontal: spacing.lg       // <<< SAME horizontal padding as page content
    },
    back: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        marginRight: spacing.sm
    },
    title: {
        ...typography.title,
        flex: 1
    } as TextStyle
});