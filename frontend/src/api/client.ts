import { Property, GuestLead, OwnerLead, WhatsAppLinkResponse, LoginCredentials, AuthResponse, User, GuestLeadRead, OwnerLeadRead } from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Token management utilities
const TOKEN_KEY = 'elemnt_admin_token';

export function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
    // Set cookie for middleware
    document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=86400; SameSite=Lax`;
}

export function clearAuthToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    // Clear cookie
    document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(error.detail || response.statusText);
    }
    const result = await response.json();
    return result.data ?? result; // Handle envelope if present
}

export const api = {
    auth: {
        login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
            const formData = new URLSearchParams();
            formData.append('username', credentials.email); // OAuth2 expects 'username'
            formData.append('password', credentials.password);

            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: formData.toString(),
            });
            return handleResponse<AuthResponse>(response);
        },
        getCurrentUser: async (): Promise<User> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`${API_BASE_URL}/users/me`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            return handleResponse<User>(response);
        },
        logout: () => {
            clearAuthToken();
        },
    },
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
        getBySlug: async (slug: string): Promise<Property> => {
            const response = await fetch(`${API_BASE_URL}/properties/public/${slug}`);
            return handleResponse<Property>(response);
        },
        // Admin endpoints
        getAll: async (params: { city?: string; active?: boolean; owner_id?: string } = {}): Promise<Property[]> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const searchParams = new URLSearchParams();
            if (params.city) searchParams.append("city", params.city);
            if (params.active !== undefined) searchParams.append("active", params.active.toString());
            if (params.owner_id) searchParams.append("owner_id", params.owner_id);

            const response = await fetch(`${API_BASE_URL}/properties?${searchParams.toString()}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            return handleResponse<Property[]>(response);
        },
        create: async (property: Partial<Property> & { owner_id: string }): Promise<Property> => {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/properties`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(property),
            });
            return handleResponse<Property>(response);
        },
        update: async (id: string, property: Partial<Property>): Promise<Property> => {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(property),
            });
            return handleResponse<Property>(response);
        },
        delete: async (id: string): Promise<void> => {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                const error = await response.json().catch(() => ({ detail: "Unknown error" }));
                throw new Error(error.detail || response.statusText);
            }
        },
        uploadImage: async (id: string, file: File, isMain: boolean = false): Promise<Property> => {
            const token = getAuthToken();
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch(`${API_BASE_URL}/properties/${id}/images?is_main=${isMain}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: formData,
            });
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
        getGuest: async (offset: number = 0, limit: number = 100): Promise<GuestLeadRead[]> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`${API_BASE_URL}/leads/guest?offset=${offset}&limit=${limit}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            return handleResponse<GuestLeadRead[]>(response);
        },
        getOwner: async (offset: number = 0, limit: number = 100): Promise<OwnerLeadRead[]> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`${API_BASE_URL}/leads/owner?offset=${offset}&limit=${limit}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            return handleResponse<OwnerLeadRead[]>(response);
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
