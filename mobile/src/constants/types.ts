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
    Contacts: undefined;
    Templates: undefined;
    Settings: undefined;
};