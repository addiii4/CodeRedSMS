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
        width: 108,
        height: 108,
    } as ImageStyle,
    title: {
        ...Typography.display,
        color: Colors.text,
    } as TextStyle,
    caption: {
        position: 'absolute',             
        bottom: Spacing.xl,
        padding: Spacing.xl,        
        alignSelf: 'center',             
        ...Typography.caption,
        color: Colors.greyStroke,
    } as TextStyle
});