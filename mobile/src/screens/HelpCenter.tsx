import React from 'react';
import { View, Text, StyleSheet, TextStyle } from 'react-native';
import color from '../constants/color';
import spacing from '../constants/spacing';
import typography from '../constants/typography';
import NavBar from '../components/NavBar';
import useAppNavigation from '../hooks/useAppNavigation';

export default function HelpCenter() {
    const navigation = useAppNavigation();
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Help Center</Text>
                <Text style={styles.body}>FAQ, guides, and troubleshooting will live here.</Text>
            </View>
            <NavBar activeTab="menu" onHome={() => navigation.navigate('Dashboard')} onCompose={() => navigation.navigate('Compose')} onMenu={() => {}} />
        </View>
    );
}
const styles = StyleSheet.create({
    container:{ flex:1, backgroundColor: color.background, justifyContent:'space-between' },
    content:{ paddingHorizontal: spacing.lg, marginTop: spacing.margin },
    title:{ ...typography.title, marginBottom: spacing.md } as TextStyle,
    body:{ ...typography.body } as TextStyle
});