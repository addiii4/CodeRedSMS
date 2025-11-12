import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextStyle,
  Alert,
} from 'react-native';
import color from '../constants/color';
import spacing from '../constants/spacing';
import typography from '../constants/typography';
import BottomCTA from '../components/BottomCTA';
import NavBar from '../components/NavBar';
import useAppNavigation from '../hooks/useAppNavigation';
import HeaderBack from '../components/HeaderBack';
import { useRoute, RouteProp } from '@react-navigation/native';
import { contactsApi } from '../services/contacts';
import { groupsApi } from '../services/groups';

type RootStackParamList = {
  PersonEdit: { groupId?: string };
  Dashboard: undefined;
  Compose: undefined;
  Settings: undefined;
};

export default function PersonEdit() {
  const navigation = useAppNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'PersonEdit'>>();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');

  const handleSave = async () => {
    // --- Validation ---
    if (!name.trim()) {
      Alert.alert('Error', 'Full name is required.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Error', 'Phone number is required.');
      return;
    }

    try {
      // 1️⃣ Create contact
      const contact = await contactsApi.create({
        fullName: name.trim(),
        phoneE164: phone.trim(),
      });

      // 2️⃣ Link to group if opened from GroupDetail
      if (route.params?.groupId) {
        await groupsApi.addMember(route.params.groupId, contact.id);
      }

      Alert.alert('Success', 'Contact saved successfully!');
      navigation.goBack();
    } catch (err: any) {
      console.error('Save Member Error:', err);
      Alert.alert('Error', err.message || 'Failed to save member');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={{ marginHorizontal: -spacing.lg }}>
          <HeaderBack title="Add Member" />
        </View>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Alice Chen"
          placeholderTextColor={color.greyStroke}
        />

        <Text style={[styles.label, { marginTop: spacing.md }]}>
          Phone Number
        </Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="+61 400 123 456"
          keyboardType="phone-pad"
          placeholderTextColor={color.greyStroke}
        />

        <Text style={[styles.label, { marginTop: spacing.md }]}>
          Role (optional)
        </Text>
        <TextInput
          style={styles.input}
          value={role}
          onChangeText={setRole}
          placeholder="e.g. Fire Warden"
          placeholderTextColor={color.greyStroke}
        />

        <View style={{ height: spacing.margin }} />
      </View>

      <View style={styles.footer}>
        <BottomCTA label="Save Member" onPress={handleSave} />
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
  container: {
    flex: 1,
    backgroundColor: color.background,
    justifyContent: 'space-between',
  },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  header: { ...typography.title, marginBottom: spacing.md } as TextStyle,
  footer: { backgroundColor: color.background },
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
});
