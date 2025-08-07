import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TextStyle, ImageStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native'; 
import Colors from '../constants/colors';
import Typography from '../constants/typography';
import Spacing from '../constants/spacing';

export default function Splash() {
    const navigation = useNavigation<any>();

    useEffect(() => {
        const timer = setTimeout(() => {
        navigation.navigate('Login');
        }, 3000);
    return () => clearTimeout(timer);
    }, []);

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
        padding: Spacing.lg
    },
    logo: {
        width: 96,
        height: 96,
        marginBottom: Spacing.md
    } as ImageStyle,
    title: {
        ...Typography.display,
        color: Colors.primary
    } as TextStyle,
    caption: {
        ...Typography.caption,
        color: Colors.greyStroke
    } as TextStyle
});