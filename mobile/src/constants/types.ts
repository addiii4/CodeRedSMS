import { Contact } from "../services/contacts";

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
    TemplatePreview: { 
    title: string; 
    body: string; 
    templateId?: string;
    mode?: 'use' | 'edit';
    };
    Logs: undefined;
    LogDetail: { id: string };
    // Other
    Templates: undefined;
    TemplateEdit: undefined;
    Contacts: { refresh?: boolean } | undefined;
    ContactDetail: { contact: Contact };
    GroupDetail: { groupId: string };
    PersonEdit: { groupId?: string } | undefined;
    GroupEdit: undefined;
    BuyCredits: undefined;
    Settings: undefined;
    Profile: undefined;
    ChangePassword: undefined;
    PurchaseHistory: undefined;
    HelpCenter: undefined;
    ContactUs: undefined;
    ContactImport: undefined;
    OrgSettings: undefined;
    OrgMembers: undefined;
};