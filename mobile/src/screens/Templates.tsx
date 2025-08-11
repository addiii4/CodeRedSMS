import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextStyle } from 'react-native';
import spacing from '../constants/spacing';
import color from '../constants/color';
import typography from '../constants/typography';
import SearchBar from '../components/SearchBar';
import ListRow from '../components/ListRow';
import BottomCTA from '../components/BottomCTA';
import NavBar from '../components/NavBar';
import useAppNavigation from '../hooks/useAppNavigation';

export default function Templates() {
    const navigation = useAppNavigation();
    const [q, setQ] = useState('');

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.header}>Templates</Text>
                <SearchBar value={q} onChangeText={setQ} placeholder="Search templates…" />

                <View style={{ marginTop: spacing.md }}>
                    <ListRow
                        title="Fire Alarm – Evacuate Now"
                        meta="132 chars"
                        onPress={() => navigation.navigate('TemplatePreview', {
                            title: 'Fire Alarm – Evacuate Now',
                            body: 'Fire Alarm – Evacuate Now. Please proceed to the nearest exit and assemble at the designated area.'
                        })}
                    />
                    <ListRow
                        title="Maintenance Notice Tonight"
                        meta="104 chars"
                        onPress={() => navigation.navigate('TemplatePreview', {
                            title: 'Maintenance Notice Tonight',
                            body: 'Scheduled maintenance tonight from 9pm to 11pm. Expect brief outages.'
                        })}
                    />
                    <ListRow
                        title="Evacuation Drill Reminder"
                        meta="92 chars"
                        onPress={() => navigation.navigate('TemplatePreview', {
                            title: 'Evacuation Drill Reminder',
                            body: 'Reminder: Evacuation drill at 10:30am. Please follow wardens’ instructions.'
                        })}
                    />
                </View>

                <View style={{ height: spacing.margin }} />
            </ScrollView>

            <BottomCTA label="Create Template" onPress={() => navigation.navigate('TemplateEdit')} />

            <NavBar
                activeTab="home"
                onHome={() => navigation.navigate('Dashboard')}
                onCompose={() => navigation.navigate('Compose')}
                onMenu={() => navigation.navigate('Settings')}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: color.background, justifyContent: 'space-between' },
    content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
    header: { ...typography.title, marginTop: spacing.margin, marginBottom: spacing.md } as TextStyle
});