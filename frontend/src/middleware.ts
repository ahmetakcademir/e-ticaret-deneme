import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// admin_token kontrol edilecek
export function middleware(request: NextRequest) {
    const token = request.cookies.get('admin_token')?.value;

    // Sadece /admin yollarını koru
    if (request.nextUrl.pathname.startsWith('/admin')) {

        // Login sayfasındaysa devam etmeli, yoksa sonsuz döngü olur
        if (request.nextUrl.pathname === '/admin/login') {
            if (token) {
                // Zaten giriş yapmışsa /admin dashboard'a gitsin
                return NextResponse.redirect(new URL('/admin', request.url));
            }
            return NextResponse.next();
        }

        // Token yoksa login sayfasına yönlendir
        if (!token) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }

        // Basit bir koruma; gerçek senaryoda jwt decode veya api kontrolü yapılabilir.
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
