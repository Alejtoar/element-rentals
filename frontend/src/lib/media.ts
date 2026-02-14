export function getMediaUrl(path?: string): string {
    if (!path) return "";
    if (path.startsWith("http")) return path;

    // Media URL Strategy:
    // - Browser: Use relative path (empty base) to route through Next.js proxy
    // - Server (SSR): Use internal Docker URL or localhost
    const isServer = typeof window === 'undefined';
    const baseUrl = isServer
        ? (process.env.API_PROXY_URL || 'http://localhost:8000')
        : '';

    // Ensure path starts with /
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    return `${baseUrl}${normalizedPath}`;
}
