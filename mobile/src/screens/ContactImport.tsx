import React, { useState } from 'react';
import {
    View, Text, StyleSheet, Pressable, TextStyle,
    ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import Papa from 'papaparse';
import color from '../constants/color';
import spacing from '../constants/spacing';
import typography from '../constants/typography';
import BottomCTA from '../components/BottomCTA';
import NavBar from '../components/NavBar';
import useAppNavigation from '../hooks/useAppNavigation';
import HeaderBack from '../components/HeaderBack';
import { contactsApi, BulkImportRow } from '../services/contacts';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Normalise a phone number to E164 format (best-effort). */
function normalisePhone(raw: string): string {
    const digits = raw.replace(/[^\d+]/g, '');
    if (digits.startsWith('+')) return digits;
    // If 10 digits assume AU (+61) — adjust for your region or leave as-is
    if (digits.length === 10 && digits.startsWith('0')) return '+61' + digits.slice(1);
    // If already looks like a full number with country code
    if (digits.length >= 11) return '+' + digits;
    return digits; // return as-is; backend validation will catch bad numbers
}

/** Map raw CSV header names to our canonical keys (case-insensitive). */
function mapRow(raw: Record<string, string>): BulkImportRow | null {
    const find = (...keys: string[]) => {
        for (const k of keys) {
            const match = Object.keys(raw).find(h => h.trim().toLowerCase() === k.toLowerCase());
            if (match && raw[match]?.trim()) return raw[match].trim();
        }
        return '';
    };

    const fullName = find('name', 'full name', 'fullname', 'contact name');
    const rawPhone = find('phone', 'phone number', 'mobile', 'number', 'phonenumber');
    const rawGroups = find('groups', 'group', 'group name', 'group names');

    if (!fullName || !rawPhone) return null;

    const phoneE164 = normalisePhone(rawPhone);
    const groupNames = rawGroups
        ? rawGroups.split(',').map(g => g.trim()).filter(Boolean)
        : [];

    return { fullName, phoneE164, groupNames: groupNames.length ? groupNames : undefined };
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Sample data — for testing on simulator where no real CSV is available
// ---------------------------------------------------------------------------
const SAMPLE_ROWS: BulkImportRow[] = [
    { fullName: 'Alice Johnson', phoneE164: '+61400000001', groupNames: ['Floor 1'] },
    { fullName: 'Bob Smith',     phoneE164: '+61400000002', groupNames: ['Floor 1', 'Fire Wardens'] },
    { fullName: 'Carol White',   phoneE164: '+61400000003', groupNames: ['Floor 2'] },
];

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

type ParsedPreview = { rows: BulkImportRow[]; fileName: string };

export default function ContactImport() {
    const navigation = useAppNavigation();
    const [preview, setPreview] = useState<ParsedPreview | null>(null);
    const [importing, setImporting] = useState(false);

    function handleLoadSample() {
        setPreview({ rows: SAMPLE_ROWS, fileName: 'sample-data (3 contacts)' });
    }

    async function handlePickCsv() {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '*/*'],
                copyToCacheDirectory: true,
            });
            if (result.canceled || !result.assets?.[0]) return;

            const asset = result.assets[0];
            const content = await FileSystem.readAsStringAsync(asset.uri);

            const parsed = Papa.parse<Record<string, string>>(content, {
                header: true,
                skipEmptyLines: true,
            });

            const rows: BulkImportRow[] = [];
            const badRows: number[] = [];

            parsed.data.forEach((raw, i) => {
                const mapped = mapRow(raw);
                if (mapped) rows.push(mapped);
                else badRows.push(i + 2); // +2 = 1-indexed + header row
            });

            if (rows.length === 0) {
                Alert.alert(
                    'No valid rows found',
                    'Make sure your CSV has columns: NAME and PHONE NUMBER.\nOptional: GROUPS (comma-separated).'
                );
                return;
            }

            if (badRows.length > 0) {
                Alert.alert(
                    'Some rows skipped',
                    `Rows ${badRows.slice(0, 5).join(', ')}${badRows.length > 5 ? '…' : ''} were skipped (missing name or phone).`
                );
            }

            setPreview({ rows, fileName: asset.name ?? 'file.csv' });
        } catch (err: any) {
            Alert.alert('Error', err?.message ?? 'Failed to read file.');
        }
    }

    async function handleImport() {
        if (!preview) return;
        setImporting(true);
        try {
            const result = await contactsApi.bulkImport(preview.rows);
            setPreview(null);
            Alert.alert(
                'Import complete',
                `✅ ${result.imported} imported\n⏭ ${result.skipped} skipped (duplicate phone)\n${result.errors.length ? `⚠️ ${result.errors.length} error(s)` : ''}`,
                [{ text: 'Done', onPress: () => navigation.goBack() }]
            );
        } catch (err: any) {
            Alert.alert('Import failed', err?.message ?? 'Please try again.');
        } finally {
            setImporting(false);
        }
    }

    function handleRemove() {
        setPreview(null);
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={{ marginHorizontal: -spacing.lg }}>
                    <HeaderBack title="Import Contacts" />
                </View>

                {/* Format instructions */}
                <View style={styles.card}>
                    <Text style={styles.sectionLabel}>CSV Format</Text>
                    <Text style={styles.instructionTitle}>Required columns</Text>
                    <Text style={styles.instruction}>• <Text style={styles.bold}>NAME</Text> — contact's full name</Text>
                    <Text style={styles.instruction}>• <Text style={styles.bold}>PHONE NUMBER</Text> — in international format (e.g. +61400000000)</Text>
                    <Text style={styles.instructionTitle}>Optional column</Text>
                    <Text style={styles.instruction}>• <Text style={styles.bold}>GROUPS</Text> — comma-separated group names to assign the contact to (e.g. Floor 1, Fire Wardens)</Text>
                    <Text style={[styles.instruction, { marginTop: spacing.sm, color: '#8E8E8E' }]}>
                        Duplicate phone numbers are automatically skipped.{'\n'}
                        Groups that don't exist yet will be created automatically.
                    </Text>
                </View>

                {/* Example row */}
                <View style={[styles.card, { marginTop: spacing.md }]}>
                    <Text style={styles.sectionLabel}>Example</Text>
                    <View style={styles.exampleRow}>
                        <Text style={styles.exampleHeader}>NAME</Text>
                        <Text style={styles.exampleHeader}>PHONE NUMBER</Text>
                        <Text style={styles.exampleHeader}>GROUPS</Text>
                    </View>
                    <View style={styles.exampleRow}>
                        <Text style={styles.exampleCell}>Jane Smith</Text>
                        <Text style={styles.exampleCell}>+61400000000</Text>
                        <Text style={styles.exampleCell}>Floor 1, Fire Wardens</Text>
                    </View>
                </View>

                {/* File picker / preview */}
                <View style={[styles.card, { marginTop: spacing.md }]}>
                    <Text style={styles.sectionLabel}>File</Text>
                    {!preview ? (
                        <>
                            <Pressable onPress={handlePickCsv} style={styles.action}>
                                <Text style={styles.actionText}>Choose CSV file…</Text>
                            </Pressable>
                            <Pressable onPress={handleLoadSample} style={[styles.action, { paddingTop: 0 }]}>
                                <Text style={[styles.actionText, { color: '#888', fontSize: 13 }]}>
                                    Use sample data (for testing)
                                </Text>
                            </Pressable>
                        </>
                    ) : (
                        <>
                            <View style={styles.previewRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.previewFileName}>{preview.fileName}</Text>
                                    <Text style={styles.previewMeta}>{preview.rows.length} valid row{preview.rows.length !== 1 ? 's' : ''} ready to import</Text>
                                </View>
                            </View>
                            <Pressable onPress={handleRemove} style={[styles.action, { marginTop: spacing.sm }]}>
                                <Text style={[styles.actionText, { color: '#A33' }]}>Remove file</Text>
                            </Pressable>
                        </>
                    )}
                </View>

                <View style={{ height: spacing.margin }} />
            </ScrollView>

            {importing && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={color.primary} />
                    <Text style={styles.loadingText}>Importing contacts…</Text>
                </View>
            )}

            <BottomCTA
                label={preview ? `Import ${preview.rows.length} contacts` : 'Choose a file first'}
                onPress={preview ? handleImport : handlePickCsv}
            />
            <NavBar
                onHome={() => navigation.navigate('Dashboard')}
                onCompose={() => navigation.navigate('Compose')}
                onMenu={() => navigation.navigate('Settings')}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: color.background },
    content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
    card: {
        backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1,
        borderColor: '#00000012', padding: spacing.md,
    },
    sectionLabel: { ...typography.label, color: '#8E8E8E', marginBottom: spacing.sm } as TextStyle,
    instructionTitle: { ...typography.label, color: '#121212', marginTop: spacing.sm, marginBottom: 2 } as TextStyle,
    instruction: { ...typography.label, color: '#444', lineHeight: 20, marginBottom: 2 } as TextStyle,
    bold: { fontWeight: '600' } as TextStyle,
    exampleRow: { flexDirection: 'row', marginBottom: 4 },
    exampleHeader: { flex: 1, ...typography.label, color: '#8E8E8E', fontWeight: '600' } as TextStyle,
    exampleCell: { flex: 1, ...typography.label, color: '#444' } as TextStyle,
    action: { paddingVertical: spacing.md },
    actionText: { ...typography.body, color: color.primary, fontWeight: '600' } as TextStyle,
    previewRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
    previewFileName: { ...typography.body } as TextStyle,
    previewMeta: { ...typography.label, color: '#8E8E8E', marginTop: 2 } as TextStyle,
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.85)',
        alignItems: 'center', justifyContent: 'center', zIndex: 10,
    },
    loadingText: { ...typography.body, marginTop: spacing.md, color: '#444' } as TextStyle,
});
