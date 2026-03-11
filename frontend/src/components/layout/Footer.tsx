"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function Footer() {
    const [storeName, setStoreName] = useState("DeniyorumButiği");
    const [contactEmail, setContactEmail] = useState("info@deniyorumbutigi.com");

    useEffect(() => {
        try {
            const saved = localStorage.getItem("admin_settings");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.storeName) setStoreName(parsed.storeName);
                if (parsed.contactEmail) setContactEmail(parsed.contactEmail);
            }
        } catch (e) { /* ignore */ }
    }, []);

    return (
        <footer className="bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div>
                        <h3 className="text-xl font-bold text-text-dark mb-3">
                            {storeName}
                        </h3>
                        <p className="text-text-muted text-sm leading-relaxed">
                            Şıklık sadelikte gizlidir. Özel koleksiyonlarımızı keşfedin.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-semibold text-text-dark mb-3 text-sm uppercase tracking-wider">Sayfalar</h4>
                        <ul className="space-y-2">
                            <li><Link href="/products" className="text-text-muted hover:text-primary transition-colors text-sm">Koleksiyon</Link></li>
                            <li><Link href="/about" className="text-text-muted hover:text-primary transition-colors text-sm">Hakkımızda</Link></li>
                            <li><Link href="/contact" className="text-text-muted hover:text-primary transition-colors text-sm">İletişim</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold text-text-dark mb-3 text-sm uppercase tracking-wider">İletişim</h4>
                        <ul className="space-y-2 text-sm text-text-muted">
                            <li>{contactEmail}</li>
                            <li>+90 555 123 4567</li>
                            <li>İstanbul, Türkiye</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-gray-100 text-center text-text-muted text-sm">
                    © {new Date().getFullYear()} {storeName}. Tüm hakları saklıdır.
                </div>
            </div>
        </footer>
    );
}
