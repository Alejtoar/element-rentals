/**
 * UTM Tracking Utility
 * 
 * Extracts UTM parameters from URL and stores them in sessionStorage
 * to persist across page navigation until conversion.
 * 
 * Based on ADR 006: Lead Metadata Traceability
 */

export interface UTMParams {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
}

const UTM_STORAGE_KEY = 'elemnt_utm_params';

/**
 * Extract UTM parameters from URL query string
 */
export function extractUTMFromURL(): UTMParams {
    if (typeof window === 'undefined') return {};

    const params = new URLSearchParams(window.location.search);
    const utmParams: UTMParams = {};

    const utmKeys: (keyof UTMParams)[] = [
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_term',
        'utm_content'
    ];

    utmKeys.forEach(key => {
        const value = params.get(key);
        if (value) {
            utmParams[key] = value;
        }
    });

    return utmParams;
}

/**
 * Store UTM parameters in sessionStorage
 * Only updates if new UTM params are found (first-touch attribution)
 */
export function storeUTMParams(params: UTMParams): void {
    if (typeof window === 'undefined') return;

    // Only store if we have at least one UTM parameter
    if (Object.keys(params).length > 0) {
        // Check if we already have stored UTMs (first-touch attribution)
        const existing = getStoredUTMParams();
        if (Object.keys(existing).length === 0) {
            sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(params));
        }
    }
}

/**
 * Retrieve stored UTM parameters from sessionStorage
 */
export function getStoredUTMParams(): UTMParams {
    if (typeof window === 'undefined') return {};

    try {
        const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error parsing stored UTM params:', error);
    }

    return {};
}

/**
 * Clear stored UTM parameters (e.g., after successful conversion)
 */
export function clearUTMParams(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(UTM_STORAGE_KEY);
}

/**
 * Initialize UTM tracking on page load
 * Call this in a useEffect or layout component
 */
export function initializeUTMTracking(): void {
    const urlParams = extractUTMFromURL();
    storeUTMParams(urlParams);
}

/**
 * Get UTM params to include in lead submission
 * Returns stored UTMs or empty object
 */
export function getUTMForSubmission(): UTMParams {
    return getStoredUTMParams();
}
