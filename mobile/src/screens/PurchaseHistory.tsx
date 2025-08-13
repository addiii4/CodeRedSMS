import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextStyle } from 'react-native';
import color from '../constants/color';
import spacing from '../constants/spacing';
import typography from '../constants/typography';
import ListRow from '../components/ListRow';
import NavBar from '../components/NavBar';
import useAppNavigation from '../hooks/useAppNavigation';
import HeaderBack from '../components/HeaderBack';

export default function PurchaseHistory() {
    const navigation = useAppNavigation();
    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={{ marginHorizontal: -spacing.lg }}>
                    <HeaderBack title="Purchase History" />
                </View>
                <ListRow title="2,000 Credits" meta="$149 · 12 Aug 2025" showChevron={false} />
                <ListRow title="500 Credits" meta="$49 · 01 Aug 2025" showChevron={false} />
                <ListRow title="10,000 Credits" meta="$599 · 15 Jul 2025" showChevron={false} />
                <View style={{ height: spacing.margin }} />
            </ScrollView>
            <NavBar onHome={() => navigation.navigate('Dashboard')} onCompose={() => navigation.navigate('Compose')} onMenu={() => navigation.navigate('Settings')} />
        </View>
    );
}
const styles = StyleSheet.create({
    container:{ flex:1, backgroundColor: color.background },
    content:{ paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
    title:{ ...typography.title, marginBottom: spacing.md } as TextStyle
});