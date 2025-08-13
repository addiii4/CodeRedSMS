import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextStyle } from 'react-native';
import color from '../constants/color';
import spacing from '../constants/spacing';
import typography from '../constants/typography';
import ListRow from '../components/ListRow';
import BottomCTA from '../components/BottomCTA';
import NavBar from '../components/NavBar';
import useAppNavigation from '../hooks/useAppNavigation';
import HeaderBack from '../components/HeaderBack';

export default function ContactImport() {
    const navigation = useAppNavigation();
    const [hasCsv, setHasCsv] = useState(false);

    const importFromPhone = async () => {
        // Later: expo-contacts
        // expo install expo-contacts
        // askAsync(Permissions), Contacts.getContactsAsync()
    };

    const importFromCsv = async () => {
        // Later: expo-document-picker + papaparse
        // expo install expo-document-picker
        // npm i papaparse
        // DocumentPicker.getDocumentAsync({ type: 'text/csv' })
        // Papa.parse(file, { header: true })
        setHasCsv(true);
    };

    const removeCsv = () => setHasCsv(false);

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={{ marginHorizontal: -spacing.lg }}>
                    <HeaderBack title="Manage Contacts" />
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionLabel}>Import</Text>
                    <Pressable onPress={importFromPhone} style={styles.action}>
                        <Text style={styles.actionText}>Import from phone contacts</Text>
                    </Pressable>
                    <Pressable onPress={importFromCsv} style={styles.action}>
                        <Text style={styles.actionText}>Import from CSV</Text>
                    </Pressable>
                </View>

                <View style={[styles.card, { marginTop: spacing.md }]}>
                    <Text style={styles.sectionLabel}>CSV Files</Text>
                    {hasCsv ? (
                        <>
                            <ListRow title="contacts.csv" meta="324 rows · uploaded today" rightIcon={null} />
                            <Pressable onPress={removeCsv} style={[styles.action, { marginTop: spacing.sm }]}>
                                <Text style={[styles.actionText, { color: '#A33' }]}>Remove CSV</Text>
                            </Pressable>
                        </>
                    ) : (
                        <Text style={styles.meta}>No CSV uploaded.</Text>
                    )}
                </View>
            </View>

            <View style={styles.footer}>
                <BottomCTA label="Done" onPress={() => navigation.goBack()} />
                <NavBar
                    onHome={() => navigation.navigate('Dashboard')}
                    onCompose={() => navigation.navigate('Compose')}
                    onMenu={() => navigation.navigate('Settings')} 
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container:{ flex:1, backgroundColor: color.background, justifyContent:'space-between' },
    content:{ paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
    title:{ ...typography.title, marginBottom: spacing.md } as TextStyle,
    card:{
        backgroundColor:'#FFFFFF', borderRadius:12, borderWidth:1, borderColor:'#00000012', padding: spacing.md
    },
    sectionLabel:{ ...typography.label, color:'#8E8E8E', marginBottom: spacing.sm } as TextStyle,
    action:{ paddingVertical: spacing.md },
    footer: { backgroundColor: color.background },
    actionText:{ ...typography.body, color: color.primary, fontWeight:600 } as TextStyle,
    meta:{ ...typography.label, color:'#8E8E8E' } as TextStyle
});