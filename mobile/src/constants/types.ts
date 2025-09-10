export type RootStackParamList = {
    Splash: undefined;
    Login: undefined;
    Signup: undefined;
    Dashboard: undefined;
    // Compose flow
    Compose: { presetTitle?: string; presetBody?: string } | undefined;
    SelectGroups: {
        fromCompose?: boolean;
        draftTitle?: string;
        draftBody?: string;
    } | undefined;
    ScheduleReview: {
        title: string;
        body: string;
        groupIds: string[];
        contactIds: string[];
        adHocNumbers?: string[];
    };
    Logs: undefined;
    LogDetail: { id: string };
    // Template preview
    TemplatePreview: { title: string; body: string };
    // Other
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