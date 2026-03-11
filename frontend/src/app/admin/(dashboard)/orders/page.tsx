"use client";
import { useEffect, useState } from "react";
import { FiShoppingBag, FiSearch, FiFilter } from "react-icons/fi";

interface Order {
    id: number;
    orderNumber: string;
    customerFirstName: string;
    customerLastName: string;
    totalAmount: number;
    paymentStatus: string;
    orderDate: string;
    orderItems: any[];
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];

        fetch("/api/orders", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.isSuccess) {
                    setOrders(Array.isArray(data.data) ? data.data : []);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Siparişler yüklenemedi:", err);
                setLoading(false);
            });
    }, []);

    const filteredOrders = orders.filter(o =>
        (o.customerFirstName + " " + o.customerLastName)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.id.toString().includes(searchTerm)
    );

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case "paid":
            case "ödendi":
                return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400">Ödendi</span>;
            case "pending":
            case "bekliyor":
                return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-yellow-500/10 text-yellow-400">Bekliyor</span>;
            case "cancelled":
            case "iptal":
                return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-500/10 text-red-400">İptal</span>;
            default:
                return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-neutral-500/10 text-neutral-400">{status || "—"}</span>;
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
        } catch {
            return dateStr || "—";
        }
    };

    return (
        <div className="space-y-6 animate-fade-in relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Siparişler</h1>
                    <p className="text-neutral-400 mt-1">Müşteri siparişlerini görüntüleyin ve yönetin.</p>
                </div>
            </div>

            <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
                <div className="p-4 border-b border-neutral-700/50 flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative flex-1 w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiSearch className="text-neutral-500" />
                        </div>
                        <input
                            type="text"
                            placeholder="Sipariş no veya müşteri adı ile ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-[#d4af37] transition-colors"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-neutral-700 hover:border-neutral-500 rounded-xl transition-colors whitespace-nowrap">
                        <FiFilter className="text-neutral-400" />
                        <span className="text-sm font-medium text-neutral-300">Filtrele</span>
                    </button>
                </div>

                {loading ? (
                    <div className="p-12 flex flex-col items-center justify-center text-center">
                        <div className="animate-pulse text-neutral-500">Siparişler yükleniyor...</div>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="p-12 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mb-4 border border-neutral-700">
                            <FiShoppingBag size={28} className="text-neutral-500" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">Henüz Sipariş Yok</h3>
                        <p className="text-neutral-400 max-w-sm">Mağazanız henüz sipariş almadı. Satış yapmaya başladığınızda siparişleriniz burada listelenecektir.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-neutral-900/50 border-b border-neutral-700/50 text-neutral-400 text-sm font-medium">
                                    <th className="p-4 whitespace-nowrap">Sipariş No</th>
                                    <th className="p-4">Müşteri</th>
                                    <th className="p-4">Toplam</th>
                                    <th className="p-4 text-center">Durum</th>
                                    <th className="p-4">Tarih</th>
                                    <th className="p-4 text-center">Ürün</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-700/50">
                                {filteredOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-neutral-800/30 transition-colors">
                                        <td className="p-4 text-[#d4af37] font-mono font-bold">#{order.orderNumber || order.id}</td>
                                        <td className="p-4">
                                            <div className="font-medium text-white">{order.customerFirstName} {order.customerLastName}</div>
                                        </td>
                                        <td className="p-4 font-medium text-white">₺{order.totalAmount?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</td>
                                        <td className="p-4 text-center">{getStatusBadge(order.paymentStatus)}</td>
                                        <td className="p-4 text-neutral-400 text-sm">{formatDate(order.orderDate)}</td>
                                        <td className="p-4 text-center text-neutral-400">{order.orderItems?.length || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

