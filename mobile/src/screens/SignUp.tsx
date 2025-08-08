import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    TextStyle
} from 'react-native';
import Colors from '../constants/colors';
import Spacing from '../constants/spacing';
import Typography from '../constants/typography';
import useAppNavigation from '../hooks/useAppNavigation';

export default function SignupScreen() {
    const navigation = useAppNavigation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setBuildingCode] = useState('');
    const [password, setPassword] = useState('');

    const handleSignup = () => {
        console.log('Signup:', { name, email, phone, password });
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
                    value={phone}
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