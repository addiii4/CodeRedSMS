import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, TextStyle } from 'react-native';
import color from '../constants/color';
import spacing from '../constants/spacing';
import typography from '../constants/typography';
import ListRow from '../components/ListRow';
import NavBar from '../components/NavBar';
import useAppNavigation from '../hooks/useAppNavigation';
import HeaderBack from '../components/HeaderBack';
import { useFocusEffect } from '@react-navigation/native';
import { paymentsApi, PurchaseHistoryItem } from '../services/payments';

export default function PurchaseHistory() {
  const navigation = useAppNavigation();
  const [items, setItems] = useState<PurchaseHistoryItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      paymentsApi
        .history()
        .then((res) => setItems(res.items))
        .catch((e) => console.error('Load history failed', e));
    }, []),
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={{ marginHorizontal: -spacing.lg }}>
          <HeaderBack title="Purchase History" />
        </View>

        {items.map((item) => (
          <ListRow
            key={item.id}
            title={`${item.amount} Credits`}
            meta={`${item.reason} · ${new Date(item.createdAt).toLocaleDateString()}`}
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
  title: { ...typography.title, marginBottom: spacing.md } as TextStyle,
});
