export type RootStackParamList = {
    Splash: undefined;
    Login: undefined;
    Signup: undefined;
    Dashboard: undefined;
    // Compose flow
    Compose: { presetTitle?: string; presetBody?: string } | undefined;
    SelectGroups: undefined;
    ScheduleReview: undefined;
    // Template preview
    TemplatePreview: { title: string; body: string };
    // Other
    Logs: undefined;
    Templates: undefined;
    TemplateEdit: undefined;
    Contacts: undefined;
    GroupDetail: undefined;
    PersonEdit: undefined;
    GroupEdit: undefined;
    BuyCredits: undefined;
    Settings: undefined;
    Profile: undefined;
    ChangePassword: undefined;
    PaymentMethods: undefined;
    PurchaseHistory: undefined;
    HelpCenter: undefined;
    ContactUs: undefined;
    ContactImport: undefined;
};