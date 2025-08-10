import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import typography from '../constants/typography';

type Props = { text: string };

export default function SectionTitle({ text }: Props) {
    return <Text style={styles.title}>{text}</Text>;
}

const styles = StyleSheet.create({
    title: {
        ...typography.sectionTitle,
        marginTop: 24,
        marginBottom: 12
    } as TextStyle
});