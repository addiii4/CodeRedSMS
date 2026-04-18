import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '../constants/types';

/**
 * App-wide navigation ref — allows non-component code (api.ts, auth handlers)
 * to navigate without needing a React context.
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();
