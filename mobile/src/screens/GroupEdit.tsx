import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, TextStyle, Alert } from 'react-native';
import color from '../constants/color';
import spacing from '../constants/spacing';
import typography from '../constants/typography';
import BottomCTA from '../components/BottomCTA';
import NavBar from '../components/NavBar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import HeaderBack from '../components/HeaderBack';

import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';

export default function GroupEdit() {
    
    type RootStackParamList = {
        Contacts: { refresh?: boolean };
        GroupEdit: undefined;
        Dashboard: undefined;
        Compose: undefined;
        Settings: undefined;
    };
    type NavigationProps = NativeStackNavigationProp<
        RootStackParamList,
        'GroupEdit'
    >;
    const navigation = useNavigation<NavigationProps>();
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={{ marginHorizontal: -spacing.lg }}>
                    <HeaderBack title="New Group" />
                </View>

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
                <BottomCTA label="Save Group" onPress={async () => {
                    try {
                        const token = await SecureStore.getItemAsync('codered_access_token');
                        if (!token) throw new Error('No token found');
                        if (!name.trim()) {
                            Alert.alert('Error', 'Group name is required.');
                            return;
                        }

                        const res = await fetch('http://localhost:3000/api/groups', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ name, description: desc })
                        });
                        if (!res.ok) throw new Error(await res.text());
                        Alert.alert('Success', 'Group saved successfully!');
                        navigation.navigate('Contacts', { refresh: true });
                    } catch (err) {
                        console.error('Failed to save group:', err);
                        Alert.alert('Error', 'Could not save group.');
                    }
                }} />
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
    container: { flex: 1, backgroundColor: color.background, justifyContent: 'space-between' },
    content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
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