export interface UserProfile {
    id: number;
    fullname: string;
    email: string;
    phone: string;
    image?: string;
    birthday?: string;
    gender?: 'male' | 'female' | 'other' | '';
    status?: string;
    verificationCode?: string;
    subscription?: string;
    companiesOwned?: string[];
    companiesJoined?: string[];
    twoFactorEnabled?: boolean;
  }
  
