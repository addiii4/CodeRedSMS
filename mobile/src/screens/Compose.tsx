import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TextStyle } from 'react-native';
import spacing from '../constants/spacing';
import color from '../constants/color';
import typography from '../constants/typography';
import SegmentedControl from '../components/SegmentedControl';
import SearchBar from '../components/SearchBar';
import ListRow from '../components/ListRow';
import BottomCTA from '../components/BottomCTA';
import NavBar from '../components/NavBar';
import useAppNavigation from '../hooks/useAppNavigation';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../constants/types';

type ComposeParams = RouteProp<RootStackParamList, 'Compose'>;

export default function Compose() {
    const navigation = useAppNavigation();
    const route = useRoute<ComposeParams>();

    const [tab, setTab] = useState<'Templates' | 'Custom'>('Templates');
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [q, setQ] = useState('');

    // Prefill from TemplatePreview (and switch to Custom)
    useEffect(() => {
        const presetTitle = route.params?.presetTitle ?? '';
        const presetBody = route.params?.presetBody ?? '';
        if (presetTitle || presetBody) {
            setTitle(presetTitle);
            setBody(presetBody);
            setTab('Custom');
        }
    }, [route.params]);

    const charCount = body.length;
    const creditsEst = Math.max(1, Math.ceil(charCount / 160));

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.header}>New Message</Text>

                <SegmentedControl
                    segments={['Templates', 'Custom']}
                    value={tab}
                    onChange={(v) => setTab(v as any)}
                    style={{ marginTop: spacing.md }}
                />

                {tab === 'Templates' ? (
                    <View style={{ marginTop: spacing.lg }}>
                        <SearchBar value={q} onChangeText={setQ} placeholder="Search templates…" />
                        <View style={{ marginTop: spacing.md }}>
                            <ListRow
                                title="Fire Alarm – Evacuate Now"
                                meta="132 chars"
                                onPress={() =>
                                    navigation.navigate('TemplatePreview', {
                                        title: 'Fire Alarm – Evacuate Now',
                                        body: 'Fire Alarm – Evacuate Now. Please proceed to the nearest exit and assemble at the designated area.'
                                    })
                                }
                            />
                            <ListRow
                                title="Maintenance Notice Tonight"
                                meta="104 chars"
                                onPress={() =>
                                    navigation.navigate('TemplatePreview', {
                                        title: 'Maintenance Notice Tonight',
                                        body: 'Scheduled maintenance tonight from 9pm to 11pm. Expect brief outages.'
                                    })
                                }
                            />
                            <ListRow
                                title="Evacuation Drill Reminder"
                                meta="92 chars"
                                onPress={() =>
                                    navigation.navigate('TemplatePreview', {
                                        title: 'Evacuation Drill Reminder',
                                        body: 'Reminder: Evacuation drill at 10:30am. Please follow wardens’ instructions.'
                                    })
                                }
                            />
                        </View>
                    </View>
                ) : (
                    <View style={{ marginTop: spacing.lg }}>
                        <Text style={styles.label}>Title</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter title"
                            placeholderTextColor={color.greyStroke}
                            value={title}
                            onChangeText={setTitle}
                        />
                        <Text style={[styles.label, { marginTop: spacing.md }]}>Message Body</Text>
                        <TextInput
                            style={styles.textarea}
                            placeholder="Type your message…"
                            placeholderTextColor={color.greyStroke}
                            value={body}
                            onChangeText={setBody}
                            multiline
                        />
                        <Text style={styles.counter}>{charCount} / 160 chars · ~{creditsEst} credit(s)</Text>
                    </View>
                )}
            </ScrollView>

            <BottomCTA label="Next · Recipients" onPress={() => navigation.navigate('SelectGroups')} />

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
    container: { flex: 1, backgroundColor: color.background },
    content: {
        paddingHorizontal: spacing.lg,
        paddingTop: 56,                                      // top spacing
        paddingBottom: 56 + 72 + spacing.md                  // bottom spacing + navbar
    },
    header: { ...typography.title } as TextStyle,
    label: { ...typography.label, color: color.text } as TextStyle,
    input: {
        height: 50, borderWidth: 1, borderColor: color.greyStroke, borderRadius: 12,
        paddingHorizontal: spacing.md, backgroundColor: '#FFFFFF', marginTop: spacing.sm
    },
    textarea: {
        height: 120, borderWidth: 1, borderColor: color.greyStroke, borderRadius: 12,
        paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: '#FFFFFF',
        marginTop: spacing.sm, textAlignVertical: 'top'
    },
    counter: { ...typography.label, color: '#8E8E8E', textAlign: 'right', marginTop: 6 } as TextStyle
});