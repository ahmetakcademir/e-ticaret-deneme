"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const { user, logout, token } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"info" | "orders">("info");

  useEffect(() => {
    // If we're fully loaded and there's no user, redirect to login
    /* We wait for the context to finish its initial check, usually handled in layout/authguard.
       For simplicity, if token is completely absent after mount, push to login. */
    if (!token) {
      router.push("/login");
    } else {
      fetchOrders();
    }
  }, [token, router]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://localhost:7198"}/api/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.data || []);
      }
    } catch (err) {
      console.error("Siparişler çekilemedi", err);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Options */}
        <div className="bg-white rounded-3xl p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl font-bold">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-dark">Hoş Geldiniz, {user.firstName}</h1>
              <p className="text-text-muted">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2.5 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
          >
            Çıkış Yap
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("info")}
            className={`pb-4 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === "info" ? "border-primary text-primary" : "border-transparent text-text-muted hover:text-text-dark"}`}
          >
            Kullanıcı Bilgileri
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-4 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === "orders" ? "border-primary text-primary" : "border-transparent text-text-muted hover:text-text-dark"}`}
          >
            Siparişlerim ({orders.length})
          </button>
        </div>

        {/* Info Tab */}
        {activeTab === "info" && (
          <div className="bg-white rounded-3xl p-8 shadow-sm animate-fade-in">
            <h2 className="text-xl font-bold text-text-dark mb-6">Hesap Detayları</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Adınız</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-text-dark">{user.firstName}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Soyadınız</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-text-dark">{user.lastName}</div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-muted mb-1">E-Posta Adresiniz</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-text-dark">{user.email}</div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-4 animate-fade-in">
            {orders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
                <p className="text-text-muted mb-4">Henüz hiç siparişiniz bulunmuyor.</p>
                <button onClick={() => router.push("/products")} className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors">
                  Alışverişe Başla
                </button>
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-gray-100 pb-4 mb-4">
                    <div>
                      <p className="text-sm text-text-muted">Sipariş No</p>
                      <p className="font-bold text-text-dark">{order.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-muted">Tarih</p>
                      <p className="font-medium text-text-dark">{new Date(order.orderDate).toLocaleDateString("tr-TR")}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-muted">Tutar</p>
                      <p className="font-bold text-primary">{new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(order.totalAmount)}</p>
                    </div>
                    <div>
                      <span className="px-3 py-1 bg-green-50 text-green-600 font-medium text-xs rounded-full">
                        Başarılı
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {order.orderItems.map((item: any) => (
                      <div key={item.productId} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <span className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-lg text-text-muted font-medium">
                            {item.quantity}x
                          </span>
                          <span className="font-medium text-text-dark">{item.productName}</span>
                        </div>
                        <span className="text-text-muted">
                          {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(item.unitPrice)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}
