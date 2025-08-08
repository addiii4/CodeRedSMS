import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Image,
    TextStyle
} from 'react-native';
import Colors from '../constants/colors';
import Spacing from '../constants/spacing';
import Typography from '../constants/typography';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function Dashboard() {
    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Dashboard</Text>
                    <View style={styles.creditsBadge}>
                        <Text style={styles.creditsText}>550 Credits</Text>
                    </View>
                </View>

                {/* Recent Activity */}
                <Text style={styles.sectionTitle}>Recent Activity</Text>

                <View style={styles.activityCard}>
                    <Text style={styles.body}>5 SMS sent | Today at 09:24</Text>
                </View>
                <View style={styles.activityCard}>
                    <Text style={styles.body}>12 SMS sent | Yesterday at 15:01</Text>
                </View>

                <Pressable style={styles.viewLogsButton}>
                    <Text style={styles.viewLogsText}>View All Logs</Text>
                </Pressable>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionsGrid}>
                    <View style={styles.actionItem}>
                        <View style={styles.actionCircle}>
                            <Ionicons name="add" size={28} color={Colors.text} />
                        </View>
                        <Text style={styles.label}>Compose</Text>
                    </View>
                    <View style={styles.actionItem}>
                        <View style={styles.actionCircle}>
                            <Ionicons name="people-outline" size={24} color={Colors.text} />
                        </View>
                        <Text style={styles.label}>Contacts</Text>
                    </View>
                    <View style={styles.actionItem}>
                        <View style={styles.actionCircle}>
                            <MaterialIcons name="description" size={24} color={Colors.text} />
                        </View>
                        <Text style={styles.label}>Templates</Text>
                    </View>
                    <View style={styles.actionItem}>
                        <View style={styles.actionCircle}>
                            <MaterialIcons name="list" size={24} color={Colors.text} />
                        </View>
                        <Text style={styles.label}>Logs</Text>
                    </View>
                </View>
            </ScrollView>

            {/* NavBar Placeholder */}
            <View style={styles.navBar}>
                <Ionicons name="home-outline" size={24} color={Colors.text} />
                <View style={styles.fab}>
                    <Ionicons name="add" size={24} color="white" />
                </View>
                <Ionicons name="menu-outline" size={24} color={Colors.text} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background
    },
    scrollContent: {
        padding: Spacing.md,
        paddingBottom: Spacing.xxl
    },
    header: {
        marginTop: Spacing.xxl,
        marginBottom: Spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    title: {
        ...Typography.title
    } as TextStyle,
    creditsBadge: {
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.md,
        paddingVertical: 6,
        borderRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    creditsText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14
    } as TextStyle,
    sectionTitle: {
        ...Typography.sectionTitle,
        marginTop: Spacing.xl,
        marginBottom: Spacing.md
    } as TextStyle,
    activityCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    body: {
        ...Typography.body
    } as TextStyle,
    viewLogsButton: {
        alignSelf: 'center',
        backgroundColor: Colors.primary,
        paddingVertical: 8,
        paddingHorizontal: Spacing.xl,
        borderRadius: 32,
        marginTop: Spacing.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    viewLogsText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600'
    } as TextStyle,
    actionsGrid: {
        marginTop: Spacing.lg,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: Spacing.lg
    },
    actionItem: {
        alignItems: 'center',
        width: '48%',
        marginBottom: Spacing.lg
    },
    actionCircle: {
        backgroundColor: '#FCE8EB',
        padding: Spacing.lg,
        borderRadius: 100,
        marginBottom: Spacing.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4
    },
    label: {
        ...Typography.label
    } as TextStyle,
    navBar: {
        height: 64,
        backgroundColor: '#F2F2F2',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: Spacing.md
    },
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -28
    }
});