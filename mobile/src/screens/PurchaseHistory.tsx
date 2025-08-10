import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextStyle } from 'react-native';
import color from '../constants/color';
import spacing from '../constants/spacing';
import typography from '../constants/typography';
import ListRow from '../components/ListRow';
import NavBar from '../components/NavBar';
import useAppNavigation from '../hooks/useAppNavigation';

export default function PurchaseHistory() {
    const navigation = useAppNavigation();
    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Purchase History</Text>
                <ListRow title="2,000 Credits" meta="$149 · 12 Aug 2025" />
                <ListRow title="500 Credits" meta="$49 · 01 Aug 2025" />
                <ListRow title="10,000 Credits" meta="$599 · 15 Jul 2025" />
                <View style={{ height: spacing.margin }} />
            </ScrollView>
            <NavBar activeTab="menu" onHome={() => navigation.navigate('Dashboard')} onCompose={() => navigation.navigate('Compose')} onMenu={() => {}} />
        </View>
    );
}
const styles = StyleSheet.create({
    container:{ flex:1, backgroundColor: color.background },
    content:{ paddingHorizontal: spacing.lg, marginTop: spacing.margin, paddingBottom: spacing.md },
    title:{ ...typography.title, marginBottom: spacing.md } as TextStyle
});