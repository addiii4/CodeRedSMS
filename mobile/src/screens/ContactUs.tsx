import React from 'react';
import { View, Text, StyleSheet, TextStyle } from 'react-native';
import color from '../constants/color';
import spacing from '../constants/spacing';
import typography from '../constants/typography';
import NavBar from '../components/NavBar';
import useAppNavigation from '../hooks/useAppNavigation';
import HeaderBack from '../components/HeaderBack';

export default function HelpCenter() {
    const navigation = useAppNavigation();
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={{ marginHorizontal: -spacing.lg }}>
                    <HeaderBack title="Contact Us" />
                </View>
                <Text style={styles.body}>https://www.coderedsms.com.au/</Text>
            </View>
            <NavBar activeTab="menu" onHome={() => navigation.navigate('Dashboard')} onCompose={() => navigation.navigate('Compose')} onMenu={() => {}} />
        </View>
    );
}
const styles = StyleSheet.create({
    container:{ flex:1, backgroundColor: color.background, justifyContent:'space-between' },
    content:{ paddingHorizontal: spacing.lg },
    title:{ ...typography.title, marginBottom: spacing.lg } as TextStyle,
    body:{ ...typography.body } as TextStyle
});