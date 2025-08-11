import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Image,
    TextStyle
} from 'react-native';
import Colors from '../constants/color';
import Spacing from '../constants/spacing';
import Typography from '../constants/typography';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import SecTitle from '../components/SecTitle';
import CreditsBadge from '../components/CreditsBadge';
import ActivityCard from '../components/ActivityCard';
import PrimaryButton from '../components/PrimaryButton';
import QuickActionButton from '../components/QuickActionButton';
import NavBar from '../components/NavBar';
import useAppNavigation from '../hooks/useAppNavigation';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Dashboard() {
    const navigation = useAppNavigation();

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <SafeAreaView edges={['top']} style={{ paddingTop: Spacing.md }}>
                    <View style={styles.header}>
                        <Text style={styles.title as any}>Dashboard</Text>
                        <CreditsBadge credits={550} onPress={() => navigation.navigate('BuyCredits')} />
                    </View>
                </SafeAreaView>

                <SecTitle text="Recent Activity" />
                <ActivityCard text="5 SMS sent | Today at 09:24" />
                <ActivityCard text="12 SMS sent | Yesterday at 15:01" />
                <PrimaryButton label="View All Logs" onPress={() => navigation.navigate('Logs' as never)} />

                <SecTitle text="Quick Actions" />
                <View style={styles.actionsGrid}>
                    <QuickActionButton label="Buy Credits" icon="card-outline" onPress={() => navigation.navigate('BuyCredits')} />
                    <QuickActionButton label="Contacts" icon="people-outline" onPress={() => navigation.navigate('Contacts' as never)} />
                    <QuickActionButton label="Templates" icon="description" lib="mat" onPress={() => navigation.navigate('Templates' as never)} />
                    <QuickActionButton label="Logs" icon="list" lib="mat" onPress={() => navigation.navigate('Logs' as never)} />
                </View>
            </ScrollView>

            <NavBar
                activeTab="home"
                onHome={() => navigation.navigate('Dashboard' as never)}
                onCompose={() => navigation.navigate('Compose' as never)}
                onMenu={() => navigation.navigate('Settings' as never)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background
    },
    scrollContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xl + 72
    },
    header: {
        marginBottom: Spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    title: {
        ...Typography.title
    } as TextStyle,
    actionsGrid: {
        marginTop: Spacing.lg,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: Spacing.lg
    }
});