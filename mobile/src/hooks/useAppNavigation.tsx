import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../constants/types';

export type AppNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export default function useAppNavigation() {
    return useNavigation<AppNavigationProp>();
}