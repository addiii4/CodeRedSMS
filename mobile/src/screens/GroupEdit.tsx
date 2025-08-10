//Add new group
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextStyle } from 'react-native';
import color from '../constants/color';
import spacing from '../constants/spacing';
import typography from '../constants/typography';
import BottomCTA from '../components/BottomCTA';
import NavBar from '../components/NavBar';
import useAppNavigation from '../hooks/useAppNavigation';

export default function GroupEdit() {
    const navigation = useAppNavigation();
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.header}>New Group</Text>

                <Text style={styles.label}>Group Name</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. Maintenance Staff"
                    placeholderTextColor={color.greyStroke}
                />

                <Text style={[styles.label, { marginTop: spacing.md }]}>Description (optional)</Text>
                <TextInput
                    style={styles.textarea}
                    value={desc}
                    onChangeText={setDesc}
                    placeholder="Add a short description…"
                    placeholderTextColor={color.greyStroke}
                    multiline
                />

                <View style={{ height: spacing.margin }} />
            </View>
            <View style={styles.footer}>
                <BottomCTA label="Save Group" onPress={() => navigation.goBack()} />
                <NavBar
                    activeTab="home"
                    onHome={() => navigation.navigate('Dashboard')}
                    onCompose={() => navigation.navigate('Compose')}
                    onMenu={() => navigation.navigate('Settings')}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: color.background, justifyContent: 'space-between' },
    content: { paddingHorizontal: spacing.lg, marginTop: spacing.margin, paddingBottom: spacing.md },
    header: { ...typography.title, marginBottom: spacing.md } as TextStyle,
    footer: { backgroundColor: color.background },
    label: { ...typography.label, color: color.text } as TextStyle,
    input: {
        height: 50, borderWidth: 1, borderColor: color.greyStroke, borderRadius: 12,
        paddingHorizontal: spacing.md, backgroundColor: '#FFFFFF', marginTop: spacing.sm
    },
    textarea: {
        height: 120, borderWidth: 1, borderColor: color.greyStroke, borderRadius: 12,
        paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: '#FFFFFF',
        marginTop: spacing.sm, textAlignVertical: 'top'
    }
});