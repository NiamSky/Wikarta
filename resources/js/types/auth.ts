export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    phone: string | null;
    is_active: boolean;
    role: { id: number; name: string; slug: 'super_admin' | 'admin' | 'teknisi' } | null;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
