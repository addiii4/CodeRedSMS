import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextStyle } from 'react-native';
import color from '../constants/color';
import spacing from '../constants/spacing';
import typography from '../constants/typography';
import NavBar from '../components/NavBar';
import HeaderBack from '../components/HeaderBack';
import ListRow from '../components/ListRow';
import useAppNavigation from '../hooks/useAppNavigation';
import { orgsApi, OrgMember } from '../services/orgs';

const ROLE_LABEL: Record<OrgMember['role'], string> = {
    admin: 'Admin',
    editor: 'Editor',
    viewer: 'Viewer',
};

export default function OrgMembers() {
    const navigation = useAppNavigation();
    const [members, setMembers] = useState<OrgMember[]>([]);

    useEffect(() => {
        orgsApi.getMembers().then(setMembers).catch(() => {});
    }, []);

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={{ marginHorizontal: -spacing.lg }}>
                    <HeaderBack title="Members" />
                </View>
                {members.map(m => (
                    <ListRow
                        key={m.userId}
                        title={m.displayName}
                        meta={`${m.email} · ${ROLE_LABEL[m.role]}`}
                        onPress={undefined}
                        showChevron={false}
                    />
                ))}
                <View style={{ height: spacing.margin }} />
            </ScrollView>
            <NavBar
                onHome={() => navigation.navigate('Dashboard')}
                onCompose={() => navigation.navigate('Compose')}
                onMenu={() => navigation.navigate('Settings')}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: color.background },
    content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
    header: { ...typography.title, marginTop: spacing.margin, marginBottom: spacing.md } as TextStyle,
});
