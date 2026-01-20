import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18n } from "./lib/i18n-config";

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Check if there is any supported locale in the pathname
    const pathnameIsMissingLocale = i18n.locales.every(
        (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    );

    // Redirect if there is no locale
    if (pathnameIsMissingLocale) {
        const locale = i18n.defaultLocale;

        // e.g. incoming request is /products
        // The new URL is now /en-US/products
        return NextResponse.redirect(
            new URL(
                `/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`,
                request.url
            )
        );
    }

    // Admin route protection
    const isAdminRoute = pathname.includes('/admin') && !pathname.includes('/admin/login');

    if (isAdminRoute) {
        // Check for auth token in cookies
        const token = request.cookies.get('elemnt_admin_token')?.value;

        // If no token in cookies, redirect to login
        // Note: We primarily rely on localStorage (client-side), but this adds server-side protection
        if (!token) {
            // Extract language from path
            const langMatch = pathname.match(/^\/(en|es)\//);
            const lang = langMatch ? langMatch[1] : 'es';

            // Redirect to login
            const loginUrl = new URL(`/${lang}/admin/login`, request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    // Matcher ignoring `/_next/`, `/api/` and public files (with extensions)
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
