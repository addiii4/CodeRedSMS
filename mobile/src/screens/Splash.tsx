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
        if (!ready) return; // wait for SecureStore token restore to finish

        // Short delay so the splash logo is visible
        const timer = setTimeout(() => {
            if (user) {
                // Token was valid — skip login, go straight to the app
                navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
            } else {
                // No session — show login
                navigation.navigate('Login');
            }
        }, 800);

        return () => clearTimeout(timer);
    }, [ready, user]);

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
