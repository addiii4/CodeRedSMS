import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextStyle,
  Alert,
  Pressable,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import color from '../constants/color';
import spacing from '../constants/spacing';
import typography from '../constants/typography';
import HeaderBack from '../components/HeaderBack';
import NavBar from '../components/NavBar';
import BottomCTA from '../components/BottomCTA';
import { contactsApi } from '../services/contacts';
import type { RootStackParamList } from '../constants/types';

type RouteT = RouteProp<RootStackParamList, 'ContactDetail'>;

export default function ContactDetail() {
  const navigation = useNavigation();
  const route = useRoute<RouteT>();

  const contact = useMemo(() => route.params.contact, [route.params.contact]);

  const confirmDelete = () => {
    Alert.alert(
      'Delete contact?',
      'This will remove the contact from your organisation. It will also disappear from any groups.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await contactsApi.remove(contact.id);
              Alert.alert('Deleted', 'Contact removed.');
              navigation.goBack();
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Failed to delete contact');
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={{ marginHorizontal: -spacing.lg }}>
          <HeaderBack title="Contact" />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{contact.fullName}</Text>

          <View style={{ height: spacing.md }} />

          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>{contact.phoneE164}</Text>
        </View>

        <View style={{ height: spacing.margin }} />

        <Pressable onPress={confirmDelete} style={styles.deleteRow}>
          <Ionicons name="trash-outline" size={18} color="#D32F2F" />
          <Text style={styles.deleteText}>Delete contact</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        {/* Optional later: Edit contact */}
        <BottomCTA label="Back" onPress={() => navigation.goBack()} />
        <NavBar
          onHome={() => navigation.navigate('Dashboard' as never)}
          onCompose={() => navigation.navigate('Compose' as never)}
          onMenu={() => navigation.navigate('Settings' as never)}
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
  footer: { backgroundColor: color.background },

  card: {
    marginTop: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00000010',
    padding: spacing.md,
  },

  label: { ...typography.caption, color: '#8E8E8E' } as TextStyle,
  value: { ...typography.label, color: color.text, marginTop: 6 } as TextStyle,

  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#00000010',
    gap: 10,
  },
  deleteText: { ...typography.label, color: '#D32F2F' } as TextStyle,
});
