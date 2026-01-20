export function getMediaUrl(path?: string): string {
    if (!path) return "";
    if (path.startsWith("http")) return path;

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
    // Ensure path starts with /
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    return `${baseUrl}${normalizedPath}`;
}
