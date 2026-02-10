import {
    Property,
    GuestLead,
    OwnerLead,
    WhatsAppLinkResponse,
    LoginCredentials,
    AuthResponse,
    User,
    UserCreate,
    UserUpdate,
    PasswordUpdate,
    AdminPasswordReset,
    GuestLeadRead,
    OwnerLeadRead,
    Owner,
    OwnerCreate,
    OwnerUpdate,
    Guest,
    GuestCreate,
    GuestUpdate,
    Channel,
    ChannelCreate,
    ChannelUpdate,
    Reservation,
    ReservationCreate,
    ReservationUpdate,
    Payment,
    PaymentCreate,
    PaymentUpdate,
    PaymentMethod,
    PaymentMethodCreate,
    PaymentMethodUpdate,
    Expense,
    ExpenseCreate,
    ExpenseUpdate,
    FinancialSummary
} from "../types";

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
        deleteImage: async (propertyId: string, imageId: string): Promise<Property> => {
            const token = getAuthToken();
            const response = await fetch(
                `${API_BASE_URL}/properties/${propertyId}/images/${imageId}`,
                {
                    method: "DELETE",
                    headers: { "Authorization": `Bearer ${token}` },
                }
            );
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
        getPropertyLink: async (propertyId: string, lang: "en" | "es" = "es", source?: string): Promise<WhatsAppLinkResponse> => {
            const searchParams = new URLSearchParams({ lang });
            if (source) searchParams.append("source", source);
            const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/whatsapp-link?${searchParams.toString()}`);
            return handleResponse<WhatsAppLinkResponse>(response);
        },
        getOwnerLink: async (lang: "en" | "es" = "es"): Promise<WhatsAppLinkResponse> => {
            const response = await fetch(`${API_BASE_URL}/owners/whatsapp-link?lang=${lang}`);
            return handleResponse<WhatsAppLinkResponse>(response);
        },
    },
    owners: {
        getAll: async (offset: number = 0, limit: number = 100): Promise<Owner[]> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`${API_BASE_URL}/owners?offset=${offset}&limit=${limit}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            return handleResponse<Owner[]>(response);
        },
        getById: async (id: string): Promise<Owner> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`${API_BASE_URL}/owners/${id}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            return handleResponse<Owner>(response);
        },
        create: async (owner: OwnerCreate): Promise<Owner> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`${API_BASE_URL}/owners`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(owner),
            });
            return handleResponse<Owner>(response);
        },
        update: async (id: string, owner: OwnerUpdate): Promise<Owner> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`${API_BASE_URL}/owners/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(owner),
            });
            return handleResponse<Owner>(response);
        },
        delete: async (id: string): Promise<void> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`${API_BASE_URL}/owners/${id}`, {
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
    },
    users: {
        getAll: async (): Promise<User[]> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`${API_BASE_URL}/users`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            return handleResponse<User[]>(response);
        },
        getById: async (id: string): Promise<User> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`${API_BASE_URL}/users/${id}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            return handleResponse<User>(response);
        },
        create: async (user: UserCreate): Promise<User> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`${API_BASE_URL}/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(user),
            });
            return handleResponse<User>(response);
        },
        update: async (id: string, user: UserUpdate): Promise<User> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`${API_BASE_URL}/users/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(user),
            });
            return handleResponse<User>(response);
        },
        resetPassword: async (id: string, data: AdminPasswordReset): Promise<void> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`${API_BASE_URL}/users/${id}/password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });
            return handleResponse<void>(response);
        },
        updateOwnPassword: async (data: PasswordUpdate): Promise<void> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`${API_BASE_URL}/users/me/password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });
            return handleResponse<void>(response);
        },
    },
    guests: {
        getAll: async (offset: number = 0, limit: number = 100): Promise<Guest[]> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`${API_BASE_URL}/guests?offset=${offset}&limit=${limit}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            return handleResponse<Guest[]>(response);
        },
        getById: async (id: string): Promise<Guest> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`${API_BASE_URL}/guests/${id}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            return handleResponse<Guest>(response);
        },
        create: async (guest: GuestCreate): Promise<Guest> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`${API_BASE_URL}/guests`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(guest),
            });
            return handleResponse<Guest>(response);
        },
        update: async (id: string, guest: GuestUpdate): Promise<Guest> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`${API_BASE_URL}/guests/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(guest),
            });
            return handleResponse<Guest>(response);
        },
        delete: async (id: string): Promise<void> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`${API_BASE_URL}/guests/${id}`, {
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
    },
    channels: {
        getAll: async (offset: number = 0, limit: number = 100): Promise<Channel[]> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`${API_BASE_URL}/channels?offset=${offset}&limit=${limit}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            return handleResponse<Channel[]>(response);
        },
        getById: async (id: string): Promise<Channel> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`${API_BASE_URL}/channels/${id}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            return handleResponse<Channel>(response);
        },
        create: async (channel: ChannelCreate): Promise<Channel> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`${API_BASE_URL}/channels`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(channel),
            });
            return handleResponse<Channel>(response);
        },
        update: async (id: string, channel: ChannelUpdate): Promise<Channel> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`${API_BASE_URL}/channels/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(channel),
            });
            return handleResponse<Channel>(response);
        },
        delete: async (id: string): Promise<void> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`${API_BASE_URL}/channels/${id}`, {
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
    },
    reservations: {
        getAll: async (params: { property_id?: string; guest_id?: string; status?: string } = {}): Promise<Reservation[]> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const searchParams = new URLSearchParams();
            if (params.property_id) searchParams.append("property_id", params.property_id);
            if (params.guest_id) searchParams.append("guest_id", params.guest_id);
            if (params.status) searchParams.append("status", params.status);

            const response = await fetch(`${API_BASE_URL}/reservations?${searchParams.toString()}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            return handleResponse<Reservation[]>(response);
        },
        getById: async (id: string): Promise<Reservation> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            return handleResponse<Reservation>(response);
        },
        create: async (reservation: ReservationCreate): Promise<Reservation> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`${API_BASE_URL}/reservations`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(reservation),
            });
            return handleResponse<Reservation>(response);
        },
        update: async (id: string, reservation: ReservationUpdate): Promise<Reservation> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(reservation),
            });
            return handleResponse<Reservation>(response);
        },
        getFinancialSummary: async (id: string): Promise<FinancialSummary> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`${API_BASE_URL}/reservations/${id}/financial-summary`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            return handleResponse<FinancialSummary>(response);
        },
    },
    payments: {
        getByReservation: async (reservationId: string): Promise<Payment[]> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`${API_BASE_URL}/payments?reservation_id=${reservationId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            return handleResponse<Payment[]>(response);
        },
        create: async (payment: PaymentCreate): Promise<Payment> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`${API_BASE_URL}/payments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(payment),
            });
            return handleResponse<Payment>(response);
        },
        update: async (id: string, payment: PaymentUpdate): Promise<Payment> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`${API_BASE_URL}/payments/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(payment),
            });
            return handleResponse<Payment>(response);
        },
        delete: async (id: string): Promise<void> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`${API_BASE_URL}/payments/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            return handleResponse<void>(response);
        },
    },
    paymentMethods: {
        getAll: async (activeOnly: boolean = false): Promise<PaymentMethod[]> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const searchParams = new URLSearchParams();
            if (activeOnly) searchParams.append("active_only", "true");

            const response = await fetch(`${API_BASE_URL}/payment-methods?${searchParams.toString()}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            return handleResponse<PaymentMethod[]>(response);
        },
        getById: async (id: string): Promise<PaymentMethod> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`${API_BASE_URL}/payment-methods/${id}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            return handleResponse<PaymentMethod>(response);
        },
        create: async (method: PaymentMethodCreate): Promise<PaymentMethod> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`${API_BASE_URL}/payment-methods`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(method),
            });
            return handleResponse<PaymentMethod>(response);
        },
        update: async (id: string, method: PaymentMethodUpdate): Promise<PaymentMethod> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`${API_BASE_URL}/payment-methods/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(method),
            });
            return handleResponse<PaymentMethod>(response);
        },
        delete: async (id: string): Promise<void> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`${API_BASE_URL}/payment-methods/${id}`, {
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
    },
    expenses: {
        getAll: async (propertyId?: string): Promise<Expense[]> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const searchParams = new URLSearchParams();
            if (propertyId) searchParams.append("property_id", propertyId);

            const response = await fetch(`${API_BASE_URL}/expenses?${searchParams.toString()}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            return handleResponse<Expense[]>(response);
        },
        getById: async (id: string): Promise<Expense> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            return handleResponse<Expense>(response);
        },
        create: async (expense: ExpenseCreate): Promise<Expense> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`${API_BASE_URL}/expenses`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(expense),
            });
            return handleResponse<Expense>(response);
        },
        update: async (id: string, expense: ExpenseUpdate): Promise<Expense> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(expense),
            });
            return handleResponse<Expense>(response);
        },
        delete: async (id: string): Promise<void> => {
            const token = getAuthToken();
            if (!token) throw new Error("No authentication token found");

            const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
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
    },
};

