import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import color from '../constants/color';
import spacing from '../constants/spacing';

type Props = {
    /** Which tab should render as active (red). Use "home" on Dashboard, "menu" on Settings root. */
    activeTab?: 'home' | 'menu';
    onHome: () => void;
    onCompose: () => void;
    onMenu: () => void;
    /** When true, tapping + is disabled, but its visual style does NOT change. */
    disableCompose?: boolean;
};

export default function NavBar({ activeTab, onHome, onCompose, onMenu, disableCompose }: Props) {
    const homeColor = activeTab === 'home' ? color.primary : '#666666';
    const menuColor = activeTab === 'menu' ? color.primary : '#666666';

    return (
        <View style={styles.wrap}>
            {/* Home */}
            <Pressable onPress={onHome} style={styles.sideBtn} hitSlop={10}>
                <Ionicons name="home-outline" size={26} color={homeColor} />
            </Pressable>

            {/* Center FAB (visuals never change) */}
            <Pressable
                onPress={disableCompose ? undefined : onCompose}
                disabled={!!disableCompose}
                style={styles.fab}
                hitSlop={10}
            >
                <Ionicons name="add" size={28} color="#FFFFFF" />
            </Pressable>

            {/* Menu */}
            <Pressable onPress={onMenu} style={styles.sideBtn} hitSlop={10}>
                <Ionicons name="menu-outline" size={26} color={menuColor} />
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
        justifyContent: 'space-around' // ← pulls side icons slightly inward (back to original feel)
    },
    sideBtn: {
        padding: 4
    },
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
        marginTop: -24 // float slightly above the bar
    }
});