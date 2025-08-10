import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import color from '../constants/colors';
import spacing from '../constants/spacing';

type Tab = 'home' | 'compose' | 'menu';
type Props = {
    activeTab: Tab;
    onNavigate: (tab: Tab) => void;
};

export default function NavBar({ activeTab, onNavigate }: Props) {
    return (
        <View style={styles.bar}>
            <Pressable onPress={() => onNavigate('home')}>
                <Ionicons name="home-outline" size={24} color={activeTab === 'home' ? color.text : '#777'} />
            </Pressable>

            <Pressable onPress={() => onNavigate('compose')} style={styles.fab}>
                <Ionicons name="add" size={24} color="#FFFFFF" />
            </Pressable>

            <Pressable onPress={() => onNavigate('menu')}>
                <Ionicons name="menu-outline" size={24} color={activeTab === 'menu' ? color.text : '#777'} />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    bar: {
        height: 72,
        backgroundColor: '#F2F2F2',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: spacing.md
    },
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: color.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 4
    }
});