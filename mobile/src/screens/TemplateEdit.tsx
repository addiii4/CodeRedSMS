import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TextStyle,
} from 'react-native';
import spacing from '../constants/spacing';
import color from '../constants/color';
import typography from '../constants/typography';
import BottomCTA from '../components/BottomCTA';
import NavBar from '../components/NavBar';
import useAppNavigation from '../hooks/useAppNavigation';
import { templatesApi } from '../services/templates';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TemplateEdit() {
  const navigation = useAppNavigation();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (saving) return;
    if (!title.trim() || !body.trim()) return;

    try {
      setSaving(true);
      await templatesApi.create({
        title: title.trim(),
        body: body.trim(),
      });
      navigation.goBack();
    } catch (e) {
      console.error('Save template failed', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>New Template</Text>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter title"
          placeholderTextColor={color.greyStroke}
        />

        <Text style={[styles.label, { marginTop: spacing.md }]}>
          Message Body
        </Text>
        <TextInput
          style={styles.textarea}
          value={body}
          onChangeText={setBody}
          placeholder="Type your message…"
          placeholderTextColor={color.greyStroke}
          multiline
        />

        <View style={{ height: spacing.margin }} />
      </ScrollView>

      <BottomCTA
        label={saving ? 'Saving...' : 'Save Template'}
        onPress={handleSave}
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
  content: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.margin,
    paddingBottom: spacing.md,
  },
  header: { ...typography.title, marginBottom: spacing.md } as TextStyle,
  label: { ...typography.label, color: color.text } as TextStyle,
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: color.greyStroke,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    backgroundColor: '#FFFFFF',
    marginTop: spacing.sm,
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
    textAlignVertical: 'top',
  },
});
