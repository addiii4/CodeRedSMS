import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextStyle } from 'react-native';
import color from '../constants/color';
import spacing from '../constants/spacing';
import typography from '../constants/typography';
import PaymentMethodCard from '../components/PaymentMethodCard';
import BottomCTA from '../components/BottomCTA';
import NavBar from '../components/NavBar';
import useAppNavigation from '../hooks/useAppNavigation';
import HeaderBack from '../components/HeaderBack';

export default function PaymentMethods() {
    const navigation = useAppNavigation();
    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={{ marginHorizontal: -spacing.lg }}>
                    <HeaderBack title="Payment Methods" />
                </View>
                <PaymentMethodCard brand="visa" last4="4242" onChange={() => {}} />
                <View style={{ height: spacing.margin }} />
            </ScrollView>
            <BottomCTA label="Add New Card" onPress={() => {}} />
            <NavBar activeTab="menu" onHome={() => navigation.navigate('Dashboard')} onCompose={() => navigation.navigate('Compose')} onMenu={() => {}} />
        </View>
    );
}
const styles = StyleSheet.create({
    container:{ flex:1, backgroundColor: color.background },
    content:{ paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
    title:{ ...typography.title, marginBottom: spacing.md } as TextStyle
});