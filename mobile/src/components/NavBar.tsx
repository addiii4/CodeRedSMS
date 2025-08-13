import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import color from '../constants/color';
import spacing from '../constants/spacing';

type Props = {
    activeTab?: 'home' | 'compose' | 'menu';
    onHome: () => void;
    onCompose: () => void;
    onMenu: () => void;
    /** NEW: disables the center (+) action, e.g., during the compose flow */
    disableCompose?: boolean;
};

export default function NavBar({ activeTab, onHome, onCompose, onMenu, disableCompose }: Props) {
    const composeDisabled = !!disableCompose;

    return (
        <View style={styles.wrap}>
            <Pressable onPress={onHome} style={styles.iconBtn} hitSlop={10}>
                <Ionicons name="home-outline" size={26} color={activeTab === 'home' ? color.primary : '#666'} />
            </Pressable>

            <Pressable
                onPress={composeDisabled ? undefined : onCompose}
                disabled={composeDisabled}
                style={[styles.fab, composeDisabled && { opacity: 0.4 }]}
                hitSlop={10}
            >
                <Ionicons name="add" size={28} color="#fff" />
            </Pressable>

            {/* IMPORTANT: keep tappable even when activeTab === 'menu' */}
            <Pressable onPress={onMenu} style={styles.iconBtn} hitSlop={10}>
                <Ionicons name="menu-outline" size={26} color={activeTab === 'menu' ? color.primary : '#666'} />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        backgroundColor: '#EFEFEF',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    iconBtn: { padding: 4 },
    fab: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: color.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
        marginTop: -24
    }
});