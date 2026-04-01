import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextStyle } from 'react-native';
import spacing from '../constants/spacing';
import color from '../constants/color';
import typography from '../constants/typography';
import SearchBar from '../components/SearchBar';
import ListRow from '../components/ListRow';
import BottomCTA from '../components/BottomCTA';
import NavBar from '../components/NavBar';
import useAppNavigation from '../hooks/useAppNavigation';
import { templatesApi, Template } from '../services/templates';
import { useFocusEffect } from '@react-navigation/native';

export default function Templates() {
  const navigation = useAppNavigation();
  const [data, setData] = useState<Template[]>([]);
  const [q, setQ] = useState('');

  const load = async () => {
    const res = await templatesApi.list();
    setData(res);
  };

  useFocusEffect(
    useCallback(() => {
      load().catch((e) => console.error('Load templates failed', e));
    }, []),
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Templates</Text>
        <SearchBar
          value={q}
          onChangeText={setQ}
          placeholder="Search templates…"
        />

        <View style={{ marginTop: spacing.md }}>
          {data
            .filter(
              (t) =>
                t.title.toLowerCase().includes(q.toLowerCase()) ||
                t.body.toLowerCase().includes(q.toLowerCase()),
            )
            .map((t) => (
              <ListRow
                key={t.id}
                title={t.title}
                meta={`${t.body.length} chars`}
                onPress={() =>
                  navigation.navigate('TemplatePreview', {
                    title: t.title,
                    body: t.body,
                    templateId: t.id,
                    mode: 'edit',
                  })
                }
              />
            ))}
        </View>

        <View style={{ height: spacing.margin }} />
      </ScrollView>

      <BottomCTA
        label="Create Template"
        onPress={() => navigation.navigate('TemplateEdit')}
      />

      <NavBar
        onHome={() => navigation.navigate('Dashboard')}
        onCompose={() => navigation.navigate('Compose')}
        onMenu={() => navigation.navigate('Settings')}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.background,
    justifyContent: 'space-between',
  },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  header: {
    ...typography.title,
    marginTop: spacing.margin,
    marginBottom: spacing.md,
  } as TextStyle,
});
