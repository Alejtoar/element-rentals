export interface PropertyImage {
    id: string;
    url: string;
    is_main: boolean;
    order: number;
}

export interface Property {
    id: string;
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

export interface WhatsAppLinkResponse {
    url: string;
}
