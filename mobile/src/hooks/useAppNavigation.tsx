import { useNavigation } from '@react-navigation/native';
import {
    NativeStackNavigationProp
} from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type AppNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const useAppNavigation = () => useNavigation<AppNavigationProp>();

export default useAppNavigation;