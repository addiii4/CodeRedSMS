import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Image,
    TextStyle,
    Alert
} from 'react-native';
import useAppNavigation from '../hooks/useAppNavigation';

import Colors from '../constants/color';
import Spacing from '../constants/spacing';
import Typography from '../constants/typography';
import Dashboard from './Dashboard';
import { useAuth } from '../state/auth';

export default function LoginScreen() {
    const navigation = useAppNavigation();
    const [buildingCode, setBuildingCode] = useState('');

    const { deviceLogin } = useAuth();

    const handleLogin = async () => {
        try {
            await deviceLogin({ buildingCode });
            navigation.navigate('Dashboard');
        } catch (e: any) {
            Alert.alert('Login failed', e.message || 'Please sign up on this device first.',
            );
        }
    };

    const handleSignup = () => {
        navigation.navigate('Signup');
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
        >
            {/* Top Logo and Login */}
            <View style={styles.top}>
                <Image
                    source={require('../../src/assets/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.loginText}>Login</Text>
            </View>

            {/* Middle Form */}
            <View style={styles.middle}>
                <Text style={styles.title}>Enter Building Code</Text>
                <Text style={styles.caption}>
                    Your building code identifies your organisation.
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="e.g. RED123"
                    placeholderTextColor={Colors.greyStroke}
                    value={buildingCode}
                    onChangeText={setBuildingCode}
                    autoCapitalize="characters"
                />

                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Continue</Text>
                </TouchableOpacity>
            </View>

            {/* Bottom Caption */}
            <View style={styles.bottom}>
                <Text style={styles.signupCaption}>
                    Need an account?{' '}
                    <Text style={styles.signupLink} onPress={handleSignup}>
                        Sign up
                    </Text>
                </Text>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: 'space-between'
    },
    top: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Spacing.margin,
        paddingHorizontal: Spacing.lg
    },
    logo: {
        width: 48,
        height: 48,
        marginRight: Spacing.sm
    },
    loginText: {
        ...Typography.title,
        color: Colors.text
    } as TextStyle,
    middle: {
        paddingHorizontal: Spacing.lg,
        justifyContent: 'center'
    },
    title: {
        ...Typography.title,
        marginBottom: Spacing.sm
    } as TextStyle,
    caption: {
        ...Typography.caption,
        marginBottom: Spacing.lg
    } as TextStyle,
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: Colors.greyStroke,
        borderRadius: 12,
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.lg,
        ...Typography.body,
        backgroundColor: '#FFFFFF'
    } as TextStyle,
    button: {
        backgroundColor: Colors.primary,
        paddingVertical: Spacing.md,
        borderRadius: 12,
        alignItems: 'center'
    },
    buttonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#FFFFFF',
        fontFamily: 'SFProDisplay-Semibold'
    } as TextStyle,
    bottom: {
        alignItems: 'center',
        marginBottom: Spacing.margin
    },
    signupCaption: {
        ...Typography.caption,
        color: Colors.greyStroke
    } as TextStyle,
    signupLink: {
        color: Colors.primary,
        fontWeight: '600'
    }
});