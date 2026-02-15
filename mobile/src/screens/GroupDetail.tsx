import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextStyle,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import spacing from '../constants/spacing';
import color from '../constants/color';
import typography from '../constants/typography';
import MemberRow from '../components/MemberRow';
import BottomCTA from '../components/BottomCTA';
import NavBar from '../components/NavBar';
import useAppNavigation from '../hooks/useAppNavigation';
import { useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { groupsApi, Group } from '../services/groups';

// Properly define param types
export type RootStackParamList = {
  GroupDetail: { groupId: string };
  PersonEdit: { groupId: string };
  Dashboard: undefined;
  Compose: undefined;
  Settings: undefined;
};

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type GroupDetailRouteProp = RouteProp<RootStackParamList, 'GroupDetail'>;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function GroupDetail() {
  const navigation = useAppNavigation();
  const route = useRoute<GroupDetailRouteProp>();
  const [group, setGroup] = useState<Group | null>(null);

  useFocusEffect(
    useCallback(() => {
      load(); // refresh group when screen regains focus
    }, [route.params?.groupId]),
  );

  const load = async () => {
    try {
      const groups = await groupsApi.list();
      const match = groups.find((g) => g.id === route.params.groupId);
      if (!match) throw new Error('Group not found');
      setGroup(match);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load group');
    }
  };

  const handleRemove = async (contactId: string) => {
    try {
      await groupsApi.removeMember(route.params.groupId, contactId);
      load(); // refresh group
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to remove member');
    }
  };

  const handleDeleteGroup = async () => {
    Alert.alert('Confirm', 'Are you sure you want to delete this group?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await groupsApi.remove(group!.id);
            Alert.alert('Success', 'Group deleted');
            navigation.navigate('Dashboard');
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to delete group');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.back}>
            <Ionicons name="chevron-back" size={24} color={color.text} />
          </Pressable>
          <Text style={styles.header}>{group?.name || 'Group'}</Text>
          <Pressable onPress={handleDeleteGroup}>
            <Ionicons name="trash" size={20} color="red" />
          </Pressable>
        </View>
        {group?.description ? (
          <View style={styles.descCard}>
            <Text style={styles.descText}>{group.description}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.meta}>Members</Text>
          {group?.members?.map((m) => (
            <MemberRow
              key={m.contact.id}
              name={m.contact.fullName}
              secondary={m.contact.phoneE164}
              onRemove={() => handleRemove(m.contact.id)}
            />
          ))}
        </View>

        <View style={{ height: spacing.margin }} />
      </ScrollView>

      <BottomCTA
        label="Add Member"
        onPress={() =>
          navigation.navigate('PersonEdit', {
            groupId: route.params.groupId,
          } as never)
        }
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.margin,
    marginBottom: spacing.md,
    justifyContent: 'space-between',
  },
  back: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  header: { ...typography.title, flex: 1 } as TextStyle,
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00000010',
    padding: spacing.md,
  },
  descCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00000010',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  descText: {
    ...typography.body,
    color: color.text,
  } as TextStyle,
  meta: {
    ...typography.label,
    color: '#8E8E8E',
    marginBottom: spacing.sm,
  } as TextStyle,
});
