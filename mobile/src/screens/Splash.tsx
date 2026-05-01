import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TextStyle, ImageStyle } from 'react-native';
import Colors from '../constants/color';
import Typography from '../constants/typography';
import Spacing from '../constants/spacing';
import useAppNavigation from '../hooks/useAppNavigation';
import { useAuth } from '../state/auth';

export default function Splash() {
    const navigation = useAppNavigation();
    const { ready, user } = useAuth();

    useEffect(() => {
        if (!ready) return; // wait for SecureStore restore to finish

        // Short delay so the splash logo is always visible
        const timer = setTimeout(() => {
            if (user) {
                // Restored session — go straight to the app
                navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
            } else {
                // No session (or session was wiped by 401 handler)
                navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            }
        }, 800);

        return () => clearTimeout(timer);
    // Only react to `ready` — user is fully resolved by the time ready flips to true.
    // Watching `user` here causes Splash to re-fire on logout, which is handled separately.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ready]);

    return (
        <View style={styles.container}>
            <Image
                source={require('../../src/assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
            />
            <Text style={styles.title}>Code Red SMS</Text>
            <Text style={styles.caption}>Powered by VSX</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
        padding: Spacing.lg,
    },
    logo: {
        width: 56,
        height: 56,
        marginBottom: Spacing.md,
    } as ImageStyle,
    title: {
        ...Typography.display,
        color: Colors.text,
    } as TextStyle,
    caption: {
        position: 'absolute',
        bottom: Spacing.margin,
        alignSelf: 'center',
        ...Typography.caption,
        color: Colors.greyStroke,
    } as TextStyle,
});
