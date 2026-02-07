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
    // UTM tracking fields
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
}

export interface OwnerLead {
    name: string;
    phone: string;
    location: string;
    message?: string;
    source: string;
    // UTM tracking fields
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
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

export interface UserCreate {
    email: string;
    full_name: string;
    password: string;
    role: 'admin' | 'staff' | 'finance';
}

export interface UserUpdate {
    email?: string;
    full_name?: string;
    role?: 'admin' | 'staff' | 'finance';
}

export interface PasswordUpdate {
    old_password: string;
    new_password: string;
}

export interface AdminPasswordReset {
    new_password: string;
}

export interface Owner {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    bank_details?: string;
    created_at: string;
}

export interface OwnerCreate {
    full_name: string;
    email: string;
    phone: string;
    bank_details?: string;
}

export interface OwnerUpdate {
    full_name?: string;
    email?: string;
    phone?: string;
    bank_details?: string;
}

// Phase 2: Operational Entities

export interface Guest {
    id: string;
    full_name: string;
    email?: string;
    phone: string;
    created_at: string;
}

export interface GuestCreate {
    full_name: string;
    email?: string;
    phone: string;
}

export interface GuestUpdate {
    full_name?: string;
    email?: string;
    phone?: string;
}

export interface Channel {
    id: string;
    name: string;
    external: boolean;
    created_at: string;
}

export interface ChannelCreate {
    name: string;
    external: boolean;
}

export interface ChannelUpdate {
    name?: string;
    external?: boolean;
}

export interface Reservation {
    id: string;
    property_id: string;
    guest_id?: string;
    channel_id: string;
    reservation_type: 'commercial' | 'owner_use';
    start_date: string;
    end_date: string;
    guest_count: number;
    total_amount: number;
    status: 'confirmed' | 'cancelled' | 'completed';
    created_at: string;
}

export interface ReservationCreate {
    property_id: string;
    guest_id?: string;
    channel_id: string;
    reservation_type: 'commercial' | 'owner_use';
    start_date: string;
    end_date: string;
    guest_count: number;
    total_amount: number;
    status?: 'confirmed' | 'cancelled' | 'completed';
}

export interface ReservationUpdate {
    guest_id?: string;
    channel_id?: string;
    reservation_type?: 'commercial' | 'owner_use';
    start_date?: string;
    end_date?: string;
    guest_count?: number;
    total_amount?: number;
    status?: 'confirmed' | 'cancelled' | 'completed';
}

export interface Payment {
    id: string;
    reservation_id: string;
    amount: number;
    payment_type: 'deposit' | 'balance' | 'penalty';
    non_refundable: boolean;
    provider: string;
    beneficiary: 'company' | 'third_party';
    percentage_applied?: number;
    status: 'paid' | 'pending';
    paid_at?: string;
    created_at: string;
}

export interface PaymentCreate {
    reservation_id: string;
    amount: number;
    payment_type: 'deposit' | 'balance' | 'penalty';
    non_refundable: boolean;
    provider: string;
    beneficiary: 'company' | 'third_party';
    percentage_applied?: number;
    status?: 'paid' | 'pending';
    paid_at?: string;
}
