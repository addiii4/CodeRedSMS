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
import BuyCredits from '../screens/BuyCredits';
import Contacts from '../screens/Contacts';
import GroupDetail from '../screens/GroupDetail';
import Logs from '../screens/Logs';
import TemplateEdit from '../screens/TemplateEdit';
import Templates from '../screens/Templates';
import GroupEdit from '../screens/GroupEdit';
import PersonEdit from '../screens/PersonEdit';
import ChangePassword from '../screens/ChangePassword';
import ContactImport from '../screens/ContactImport';
import ContactUs from '../screens/ContactUs';
import HelpCenter from '../screens/HelpCenter';
import PaymentMethods from '../screens/PaymentMethods';
import Profile from '../screens/Profile';
import PurchaseHistory from '../screens/PurchaseHistory';
import LogDetail from '../screens/LogDetail';
import { AuthProvider } from './src/state/auth.tsx';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    return (
        <AuthProvider>  
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
                <Stack.Screen name="Logs" component={Logs} />
                <Stack.Screen name="Templates" component={Templates} />
                <Stack.Screen name="TemplateEdit" component={TemplateEdit} />
                <Stack.Screen name="Contacts" component={Contacts} />
                <Stack.Screen name="GroupDetail" component={GroupDetail} />
                <Stack.Screen name="BuyCredits" component={BuyCredits} />
                <Stack.Screen name="GroupEdit" component={GroupEdit} />
                <Stack.Screen name="PersonEdit" component={PersonEdit} />
                <Stack.Screen name="Profile" component={Profile} />
                <Stack.Screen name="ChangePassword" component={ChangePassword} />
                <Stack.Screen name="PaymentMethods" component={PaymentMethods} />
                <Stack.Screen name="PurchaseHistory" component={PurchaseHistory} />
                <Stack.Screen name="HelpCenter" component={HelpCenter} />
                <Stack.Screen name="ContactUs" component={ContactUs} />
                <Stack.Screen name="ContactImport" component={ContactImport} />
                <Stack.Screen name="LogDetail" component={LogDetail} />
            </Stack.Navigator>
            </NavigationContainer>
        </AuthProvider>  
    );
}