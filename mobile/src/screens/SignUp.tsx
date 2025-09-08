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
    const { register, ready } = useAuth();

    const [fullName, setFullName] = useState(''); // not sent yet (noted for later polish)
    const [email, setEmail] = useState('');
    const [buildingCode, setBuildingCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSignup = async () => {
        if (!ready) {
            Alert.alert('Please wait', 'App is initializing. Try again in a second.');
            return;
        }
        if (!fullName || !email || !buildingCode || !password || !confirm) {
            Alert.alert('Missing info', 'Please fill all fields.');
            return;
        }
        if (password !== confirm) {
            Alert.alert('Passwords do not match', 'Please re-enter.');
            return;
        }
        try {
            setSubmitting(true);
            console.log('[Signup] starting', { email, buildingCode });
            await register({ buildingCode, email, password });
            console.log('[Signup] success, navigating');
            navigation.navigate('Dashboard');
        } catch (e: any) {
            console.log('[Signup] error', e);
            Alert.alert('Sign up failed', e?.message || 'Please try again.');
        } finally {
            setSubmitting(false);
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
                    value={fullName}
                    onChangeText={setFullName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor={Colors.greyStroke}
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                />
                <TextInput
                    style={styles.input}
                    placeholder="e.g. RED123"
                    placeholderTextColor={Colors.greyStroke}
                    autoCapitalize="characters"
                    value={buildingCode}
                    onChangeText={setBuildingCode}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Create Password"
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
                <TouchableOpacity
                    style={[styles.button, (submitting || !ready) && { opacity: 0.6 }]}
                    onPress={handleSignup}
                    disabled={submitting || !ready}>
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