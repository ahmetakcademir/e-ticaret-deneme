"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiHome, FiBox, FiList, FiLogOut, FiSettings, FiShoppingBag } from "react-icons/fi";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [isAuthed, setIsAuthed] = useState(false);
    const [checking, setChecking] = useState(true);

    // Auth guard: redirect to login if no admin_token cookie
    useEffect(() => {
        const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
        if (!token) {
            router.replace("/admin/login");
        } else {
            setIsAuthed(true);
        }
        setChecking(false);
    }, [router]);

    if (checking || !isAuthed) {
        return (
            <div className="flex h-screen bg-neutral-900 text-white items-center justify-center">
                <div className="animate-pulse text-neutral-500">Yetki kontrol ediliyor...</div>
            </div>
        );
    }

    const navItems = [
        { href: "/admin", icon: FiHome, label: "Dashboard", exact: true },
        { href: "/admin/products", icon: FiBox, label: "Ürünler" },
        { href: "/admin/orders", icon: FiShoppingBag, label: "Siparişler" },
        { href: "/admin/categories", icon: FiList, label: "Kategoriler" },
        { href: "/admin/settings", icon: FiSettings, label: "Ayarlar" },
    ];

    const isActive = (href: string, exact?: boolean) => {
        if (exact) return pathname === href;
        return pathname.startsWith(href);
    };

    const handleLogout = () => {
        document.cookie = "admin_token=; path=/; max-age=0; SameSite=Strict";
        router.push("/admin/login");
    };

    return (
        <div className="flex h-screen bg-neutral-900 text-white font-sans overflow-hidden font-base">
            <aside className="w-64 bg-neutral-950 border-r border-neutral-800 flex flex-col">
                <div className="p-6">
                    <h2 className="text-xl font-bold tracking-widest text-[#d4af37]">DENİYORUM BUTİĞİ</h2>
                    <p className="text-xs text-neutral-500 mt-1 uppercase tracking-widest">Yönetim Paneli</p>
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-4">
                    {navItems.map(item => {
                        const active = isActive(item.href, item.exact);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                    active
                                        ? "bg-[#d4af37]/10 text-[#d4af37] font-semibold"
                                        : "text-neutral-300 hover:text-white hover:bg-neutral-800"
                                }`}
                            >
                                <item.icon size={20} className={active ? "text-[#d4af37]" : ""} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-neutral-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-all w-full"
                    >
                        <FiLogOut size={20} />
                        <span className="font-medium">Çıkış Yap</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto bg-neutral-900 p-8">
                {children}
            </main>
        </div>
    );
}

