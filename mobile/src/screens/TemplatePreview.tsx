import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import spacing from '../constants/spacing';
import color from '../constants/color';
import typography from '../constants/typography';
import BottomCTA from '../components/BottomCTA';
import NavBar from '../components/NavBar';
import useAppNavigation from '../hooks/useAppNavigation';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../constants/types';

type TemplatePreviewRoute = RouteProp<RootStackParamList, 'TemplatePreview'>;

export default function TemplatePreview() {
    const navigation = useAppNavigation();
    const route = useRoute<TemplatePreviewRoute>();
    const { title: t = '', body: b = '' } = route.params ?? {};

    const [title, setTitle] = useState(t);
    const [body, setBody] = useState(b);
    const count = body.length;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Header */}
                <View style={styles.topRow}>
                    <Pressable onPress={() => navigation.goBack()} style={styles.back}>
                        <Ionicons name="chevron-back" size={24} color={color.text} />
                    </Pressable>
                    <Text style={styles.header}>Template</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <Text style={styles.label}>Title</Text>
                    <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Enter title"
                        placeholderTextColor={color.greyStroke}
                    />

                    <Text style={[styles.label, { marginTop: spacing.md }]}>Message Body</Text>
                    <TextInput
                        style={styles.textarea}
                        value={body}
                        onChangeText={setBody}
                        multiline
                        placeholder="Type your message…"
                        placeholderTextColor={color.greyStroke}
                    />
                    <Text style={styles.counter}>{count} / 160 chars</Text>
                </View>

                {/* Keep space so BottomCTA doesn’t overlap on small screens */}
                <View style={{ height: spacing.margin }} />
            </ScrollView>

            <BottomCTA
                label="Use This"
                onPress={() => navigation.navigate('Compose', { presetTitle: title, presetBody: body })}
            />

            <NavBar
                activeTab="home"
                onHome={() => navigation.navigate('Dashboard')}
                onCompose={() => navigation.navigate('Compose')}
                onMenu={() => navigation.navigate('Settings')}
                disableCompose 
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: color.background,
        justifyContent: 'space-between'
    },
    content: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.margin,
        marginBottom: spacing.md
    },
    back: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        marginRight: spacing.sm
    },
    header: {
        ...typography.title,
        flex: 1
    } as TextStyle,
    form: {
        flex: 1
    },
    label: {
        ...typography.label,
        color: color.text
    } as TextStyle,
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: color.greyStroke,
        borderRadius: 12,
        paddingHorizontal: spacing.md,
        backgroundColor: '#FFFFFF',
        marginTop: spacing.sm
    },
    textarea: {
        height: 120,
        borderWidth: 1,
        borderColor: color.greyStroke,
        borderRadius: 12,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: '#FFFFFF',
        marginTop: spacing.sm,
        textAlignVertical: 'top'
    },
    counter: {
        ...typography.label,
        color: '#8E8E8E',
        textAlign: 'right',
        marginTop: 6
    } as TextStyle
});