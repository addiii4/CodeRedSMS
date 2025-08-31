import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    TextStyle,
    Alert
} from 'react-native';
import Colors from '../constants/color';
import Spacing from '../constants/spacing';
import Typography from '../constants/typography';
import useAppNavigation from '../hooks/useAppNavigation';
import { useAuth } from '../state/auth';

export default function SignupScreen() {
    const navigation = useAppNavigation();
    const { register } = useAuth();

    const [buildingCode, setBuildingCode] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [name, setName] = useState('');

    const handleSignup = async () => {
        if (!buildingCode || !email || !password || !confirm) {
            Alert.alert('Missing info', 'Please fill all fields.');
            return;
        }
        if (password !== confirm) {
            Alert.alert('Passwords do not match', 'Please re-enter.');
            return;
        }
        try {
            await register({ buildingCode, email, password });
            navigation.navigate('Dashboard');
        } catch (e: any) {
            Alert.alert('Sign up failed', e.message || 'Try again.');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.top}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>

                <View style={styles.centerHeader}>
                    <Image
                        source={require('../../src/assets/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.headerText}>Sign Up</Text>
                </View>
            </View>

            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor={Colors.greyStroke}
                    value={name}
                    onChangeText={setName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor={Colors.greyStroke}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Building Code"
                    placeholderTextColor={Colors.greyStroke}
                    value={buildingCode}
                    onChangeText={setBuildingCode}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor={Colors.greyStroke}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor={Colors.greyStroke}
                    value={confirm}
                    onChangeText={setConfirm}
                    secureTextEntry
                />
                <TouchableOpacity style={styles.button} onPress={handleSignup}>
                    <Text style={styles.buttonText}>Create Account</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingHorizontal: Spacing.lg
    },
    top: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.margin
    },
    backText: {
        fontSize: 24,
        color: Colors.primary
    } as TextStyle,
    centerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        marginRight: 24
    },
    logo: {
        width: 48,
        height: 48,
        marginRight: Spacing.sm
    },
    headerText: {
        ...Typography.title,
        color: Colors.text
    } as TextStyle,
    form: {
        paddingTop: Spacing.margin,
        marginTop: Spacing.margin,
        paddingHorizontal: Spacing.lg,
        justifyContent: 'center'
    },
    input: {
        height: 56,
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
    } as TextStyle
});