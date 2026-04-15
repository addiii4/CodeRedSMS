import { View, Text, StyleSheet, TextInput, ScrollView, TextStyle, Linking } from 'react-native';
import spacing from '../constants/spacing';
import color from '../constants/color';
import typography from '../constants/typography';
import PricingCard from '../components/PricingCard';
import BottomCTA from '../components/BottomCTA';
import NavBar from '../components/NavBar';
import HeaderBack from '../components/HeaderBack';
import useAppNavigation from '../hooks/useAppNavigation';
import { api } from '../lib/api';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { paymentsApi } from '../services/payments';
import { AppState } from 'react-native';

type PlanKey = 'starter' | 'team' | 'enterprise' | 'custom';

const PLANS: Record<Exclude<PlanKey, 'custom'>, { credits: number; price: number; label: string }> = {
    starter: { credits: 500, price: 49, label: 'Starter' },
    team: { credits: 2000, price: 149, label: 'Team' },
    enterprise: { credits: 10000, price: 599, label: 'Enterprise' }
};

export default function BuyCredits() {
    const navigation = useAppNavigation();

    const [selected, setSelected] = useState<PlanKey | null>('starter');
    const [customCredits, setCustomCredits] = useState<string>('');

    const { credits, price } = useMemo(() => {
        if (selected === 'custom') {
            const c = Math.max(0, parseInt(customCredits || '0', 10));
            // simple tiering: $0.10 per credit with small bulk discount
            const unit = c >= 10000 ? 0.07 : c >= 2000 ? 0.08 : 0.10;
            return { credits: c, price: +(c * unit).toFixed(2) };
        }
        if (!selected) return { credits: 0, price: 0 };
        const plan = PLANS[selected];
        return { credits: plan.credits, price: plan.price };
    }, [selected, customCredits]);

    const [currentCredits, setCurrentCredits] = useState(0);

    useFocusEffect(
        useCallback(() => {
            paymentsApi
            .balance()
            .then((res: { credits: React.SetStateAction<number>; }) => setCurrentCredits(res.credits))
            .catch((e: any) => console.error('Load credits failed', e));
        }, []),
    );

    const [checkingReturn, setCheckingReturn] = useState(false);

    useEffect(() => {
        const sub = AppState.addEventListener('change', async (state) => {
            if (state === 'active' && checkingReturn) {
            try {
                const res = await paymentsApi.balance();

                // if credits increased → assume payment success
                if (res.credits > currentCredits) {
                navigation.navigate('PurchaseHistory');
                }
            } catch (e) {
                console.error('Return check failed', e);
            } finally {
                setCheckingReturn(false);
            }
            }
        });

        return () => sub.remove();
    }, [checkingReturn, currentCredits]);

    const estimatedMessages = Math.floor(credits); // 1 credit ~= 1 SMS (160 chars)
    const handleBuy = async (amount: number, credits: number) => {
        try {
            const res = await paymentsApi.checkout({ amount, credits });
            setCheckingReturn(true);
            await Linking.openURL(res.url);
        } catch (e) {
            console.error('Checkout error', e);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={{ marginHorizontal: -spacing.lg }}>
                    <HeaderBack title="Buy Credits" />
                </View>
                <Text style={styles.balanceText}>Current balance: {currentCredits} credits</Text>

                {/* Plans */}
                <View style={styles.grid}>
                    <PricingCard
                        title={PLANS.starter.label}
                        credits={PLANS.starter.credits}
                        price={`$${PLANS.starter.price}`}
                        selected={selected === 'starter'}
                        onPress={() => setSelected('starter')}
                    />
                    <PricingCard
                        title={PLANS.team.label}
                        credits={PLANS.team.credits}
                        price={`$${PLANS.team.price}`}
                        selected={selected === 'team'}
                        onPress={() => setSelected('team')}
                    />
                </View>

                <View style={[styles.grid, { marginTop: spacing.md }]}>
                    <PricingCard
                        title={PLANS.enterprise.label}
                        credits={PLANS.enterprise.credits}
                        price={`$${PLANS.enterprise.price}`}
                        selected={selected === 'enterprise'}
                        onPress={() => setSelected('enterprise')}
                    />
                    <View style={styles.customCard}>
                        <Text style={styles.customLabel}>Custom</Text>
                        <TextInput
                            style={styles.customInput}
                            placeholder="Enter credits"
                            placeholderTextColor={color.greyStroke}
                            keyboardType="numeric"
                            value={customCredits}
                            onChangeText={(t) => {
                                setSelected('custom');
                                setCustomCredits(t.replace(/[^0-9]/g, ''));
                            }}
                        />
                    </View>
                </View>

                {/* Summary */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryKey}>Credits</Text>
                        <Text style={styles.summaryVal}>{credits.toLocaleString()}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryKey}>Estimated messages</Text>
                        <Text style={styles.summaryVal}>{estimatedMessages.toLocaleString()}</Text>
                    </View>
                    <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: '#00000010', paddingTop: spacing.sm }]}>
                        <Text style={styles.summaryTotal}>Total</Text>
                        <Text style={styles.summaryTotalVal}>${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                    </View>
                </View>

                {/* Spacer to avoid overlap with CTA */}
                <View style={{ height: spacing.margin }} />
            </ScrollView>

            <BottomCTA
                label={selected === 'custom' ? 'Checkout · Custom' : 'Checkout'}
                onPress={() => {
                    if (!price) return;
                    handleBuy(price, credits);
                }}
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
    container: { flex: 1, backgroundColor: color.background, justifyContent: 'space-between' },
    content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },

    grid: { flexDirection: 'row', gap: spacing.md },
    balanceText: {
        ...typography.label,
        color: '#8E8E8E',
        marginBottom: spacing.md,
    } as TextStyle,

    customCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#00000012',
        padding: spacing.md,
        justifyContent: 'center'
    },
    customLabel: { ...typography.label, color: '#8E8E8E', marginBottom: spacing.sm } as TextStyle,
    customInput: {
        height: 50, borderWidth: 1, borderColor: color.greyStroke, borderRadius: 12,
        paddingHorizontal: spacing.md, backgroundColor: '#FFFFFF'
    },

    summaryCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#00000012',
        padding: spacing.md,
        marginTop: spacing.lg
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm
    },
    summaryKey: { ...typography.label, color: '#8E8E8E' } as TextStyle,
    summaryVal: { ...typography.body } as TextStyle,
    summaryTotal: { ...typography.body, fontWeight: 700 } as TextStyle,
    summaryTotalVal: { ...typography.body, color: color.primary, fontWeight: 700 } as TextStyle
});