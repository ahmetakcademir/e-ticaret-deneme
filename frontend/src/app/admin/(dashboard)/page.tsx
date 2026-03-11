"use client";
import { useEffect, useState } from "react";
import { FiTrendingUp, FiShoppingBag, FiDollarSign, FiAlertCircle } from "react-icons/fi";
import Link from "next/link";

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Cookie'den token alır
        const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];

        fetch("/api/dashboard/stats", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.isSuccess) {
                    setStats(data.data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="text-neutral-500 animate-pulse">İstatistikler yükleniyor...</div>;
    }

    const statCards = stats ? [
        { title: "Toplam Satış (Ciro)", value: `₺${stats.totalRevenue.toLocaleString()}`, icon: <FiDollarSign size={24} className="text-emerald-400" />, href: "/admin/orders" },
        { title: "Toplam Sipariş", value: stats.totalOrders.toString(), icon: <FiTrendingUp size={24} className="text-blue-400" />, href: "/admin/orders" },
        { title: "Sistemdeki Ürün", value: stats.totalProducts.toString(), icon: <FiShoppingBag size={24} className="text-[#d4af37]" />, href: "/admin/products" },
        { title: "Stokta Biten", value: stats.outOfStockCount.toString(), isWarning: stats.outOfStockCount > 0, icon: <FiAlertCircle size={24} className={stats.outOfStockCount > 0 ? "text-red-400" : "text-neutral-500"} />, href: "/admin/products" },
    ] : [];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard Özet</h1>
                    <p className="text-neutral-400 mt-1">Mağazanızın güncel durumunu buradan takip edebilirsiniz.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, i) => (
                    <Link href={stat.href} key={i}>
                        <div className="bg-neutral-800/50 p-6 rounded-2xl border border-neutral-700 hover:border-[#d4af37] transition-all cursor-pointer flex items-center justify-between group shadow-lg hover:shadow-[#d4af37]/10">
                            <div>
                                <h3 className="text-neutral-400 group-hover:text-white transition-colors text-sm font-medium">{stat.title}</h3>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className={`text-3xl font-bold transition-colors ${stat.isWarning ? 'text-red-400 group-hover:text-red-300' : 'text-white group-hover:text-[#d4af37]'}`}>{stat.value}</span>
                                </div>
                            </div>
                            <div className="bg-neutral-800/80 p-3 rounded-xl shadow-inner group-hover:bg-neutral-700 transition-colors">
                                {stat.icon}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
