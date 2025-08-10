import type { TextStyle } from 'react-native';

const Typography = {
    display: { fontFamily: 'SFProDisplay-Bold',    fontSize: 34, fontWeight: 700, color: '#121212' },
    title:   { fontFamily: 'SFProDisplay-Semibold', fontSize: 28, fontWeight: 600, color: '#121212' },
    sectionTitle: { fontFamily: 'SFProDisplay-Regular', fontSize: 22, fontWeight: 400, color: '#121212' },
    body:    { fontFamily: 'SFProDisplay-Regular', fontSize: 18, fontWeight: 400, color: '#121212' },
    caption: { fontFamily: 'SFProDisplay-Regular', fontSize: 14, fontWeight: 400, color: '#D6D6D6' },
    label:   { fontFamily: 'SFProDisplay-Medium',  fontSize: 12, fontWeight: 500, color: '#666666' },
} as const satisfies Record<string, TextStyle>;

export default Typography;