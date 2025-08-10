import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../constants/types';
import Splash from '../screens/Splash';
import LoginScreen from '../screens/Login';
import SignupScreen from '../screens/SignUp';
import Dashboard from '../screens/Dashboard';
import Compose from '../screens/Compose';
import SelectGroups from '../screens/SelectGroups';
import ScheduleReview from '../screens/ScheduleReview';
import TemplatePreview from '../screens/TemplatePreview';
import Settings from '../screens/Settings';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    return (
        <NavigationContainer>
        <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Splash" component={Splash} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="Dashboard" component={Dashboard} />
            <Stack.Screen name="Compose" component={Compose} />
            <Stack.Screen name="TemplatePreview" component={TemplatePreview} />
            <Stack.Screen name="SelectGroups" component={SelectGroups} />
            <Stack.Screen name="ScheduleReview" component={ScheduleReview} />
            <Stack.Screen name="Settings" component={Settings} />
        </Stack.Navigator>
        </NavigationContainer>
    );
}