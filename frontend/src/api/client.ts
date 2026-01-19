import { Property, GuestLead, OwnerLead, WhatsAppLinkResponse } from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(error.detail || response.statusText);
    }
    const result = await response.json();
    return result.data ?? result; // Handle envelope if present
}

export const api = {
    properties: {
        getPublic: async (params: { city?: string; max_guests?: number; featured?: boolean } = {}): Promise<Property[]> => {
            const searchParams = new URLSearchParams();
            if (params.city) searchParams.append("city", params.city);
            if (params.max_guests) searchParams.append("max_guests", params.max_guests.toString());
            if (params.featured !== undefined) searchParams.append("featured", params.featured.toString());

            const response = await fetch(`${API_BASE_URL}/properties/public?${searchParams.toString()}`);
            return handleResponse<Property[]>(response);
        },
        getById: async (id: string): Promise<Property> => {
            const response = await fetch(`${API_BASE_URL}/properties/${id}`);
            return handleResponse<Property>(response);
        },
    },
    leads: {
        submitGuest: async (lead: GuestLead): Promise<void> => {
            const response = await fetch(`${API_BASE_URL}/leads/guest`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(lead),
            });
            return handleResponse<void>(response);
        },
        submitOwner: async (lead: OwnerLead): Promise<void> => {
            const response = await fetch(`${API_BASE_URL}/leads/owner`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(lead),
            });
            return handleResponse<void>(response);
        },
    },
    whatsapp: {
        getPropertyLink: async (propertyId: string, lang: "en" | "es" = "es"): Promise<WhatsAppLinkResponse> => {
            const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/whatsapp-link?lang=${lang}&type=guest`);
            return handleResponse<WhatsAppLinkResponse>(response);
        },
        getOwnerLink: async (lang: "en" | "es" = "es"): Promise<WhatsAppLinkResponse> => {
            const response = await fetch(`${API_BASE_URL}/owners/whatsapp-link?lang=${lang}`);
            return handleResponse<WhatsAppLinkResponse>(response);
        },
    },
};
