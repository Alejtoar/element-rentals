export interface PropertyImage {
    id: string;
    url: string;
    is_main: boolean;
    order: number;
}

export interface Property {
    id: string;
    slug: string;
    name: string;
    description: string;
    address: string;
    city: string;
    country: string;
    max_guests: number;
    nightly_price: number;
    featured: boolean;
    active: boolean;
    main_image_url?: string;
    images?: PropertyImage[];
}

export interface GuestLead {
    property_id: string;
    name: string;
    phone: string;
    desired_dates?: string;
    message?: string;
    source: string;
}

export interface OwnerLead {
    name: string;
    phone: string;
    location: string;
    message?: string;
    source: string;
}

export interface GuestLeadRead extends GuestLead {
    id: string;
    created_at: string;
    ip_address?: string;
    user_agent?: string;
    referer?: string;
}

export interface OwnerLeadRead extends OwnerLead {
    id: string;
    created_at: string;
    ip_address?: string;
    user_agent?: string;
    referer?: string;
}

export interface WhatsAppLinkResponse {
    url: string;
}

// Admin Authentication Types
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
}

export interface User {
    id: string;
    email: string;
    full_name: string;
    role: 'admin' | 'staff' | 'finance';
}
