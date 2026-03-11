"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

const getValidImageUrl = (url: string) => {
    if (!url) return "https://via.placeholder.com/500";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const backendOrigin = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5143";
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;
    return `${backendOrigin}${cleanUrl}`;
};

export default function CheckoutPage() {
    const router = useRouter();
    const { cart: cartItems, cartTotal, clearCart } = useCart(); // Renamed cart to cartItems
    const { user } = useAuth();

    const [step, setStep] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Address Form State
    const [address, setAddress] = useState({
        fullName: "",
        email: "",
        phone: "",
        addressLine: "",
        city: "",
        country: "Türkiye"
    });

    useEffect(() => {
        setMounted(true);
        if (user) {
            setAddress(prev => ({
                ...prev,
                fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                email: user.email || ''
            }));
        }
    }, [user]);

    if (!mounted) return null;

    // Flow handlers
    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(2);
    };

    const handlePayment = async () => {
        setIsProcessing(true);

        try {
            const checkoutPayload = {
                customerName: address.fullName,
                customerEmail: address.email,
                customerPhone: address.phone,
                shippingAddress: `${address.addressLine}, ${address.city}, ${address.country}`,
                cardNumber: "5890040000000016",
                cardExpiry: "12/30",
                cardCvc: "123",
                items: cartItems.map(item => ({ // Changed cart to cartItems
                    productId: item.id,
                    productName: item.name,
                    quantity: item.quantity,
                    unitPrice: item.price,
                    selectedSize: item.size || null,
                    selectedColor: item.color || null
                }))
            };

            const res = await fetch("/api/orders/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(checkoutPayload)
            });

            const data = await res.json();

            if (data.isSuccess) {
                const orderId = data.data?.id || data.data?.orderId;
                clearCart();
                router.push(`/checkout/success?orderId=${orderId || ""}`);
            } else {
                alert(data.message || "Ödeme başarısız oldu. Lütfen tekrar deneyin.");
            }
        } catch (error) {
            console.error("Ödeme hatası", error);
            alert("Ödeme sırasında bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setIsProcessing(false);
        }
    };

    // If cart is empty (and they somehow navigated here)
    if (cartItems.length === 0) { // Changed cart to cartItems
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold mb-4">Sepetiniz Boş</h2>
                <button onClick={() => router.push("/products")} className="text-primary hover:underline">
                    Alışverişe Dön
                </button>
            </div>
        );
    }

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(amount);
    };

    const finalTotal = cartTotal + (cartTotal > 1500 ? 0 : 49.9);

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">

            {/* Checkout Progress indicator */}
            <div className="flex items-center justify-center mb-12">
                <div className={`flex items-center ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-current font-bold bg-white z-10">1</div>
                    <span className="ml-2 font-medium">Adres</span>
                </div>
                <div className={`w-24 h-1 mx-2 rounded ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-current font-bold bg-white z-10">2</div>
                    <span className="ml-2 font-medium">Ödeme</span>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-12">
                {/* Left Form Area */}
                <div className="md:w-2/3">

                    {step === 1 && (
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm animate-fade-in">
                            <h2 className="text-2xl font-bold text-text-dark mb-6">Teslimat Adresi</h2>
                            <form onSubmit={handleNextStep} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-1">Ad Soyad</label>
                                    <input required type="text" value={address.fullName} onChange={e => setAddress({ ...address, fullName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50" placeholder="Örn: Ayşe Yılmaz" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-muted mb-1">E-posta</label>
                                        <input required type="email" value={address.email} onChange={e => setAddress({ ...address, email: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50" placeholder="ornek@mail.com" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-muted mb-1">Telefon</label>
                                        <input required type="tel" value={address.phone} onChange={e => setAddress({ ...address, phone: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50" placeholder="05XX XXX XX XX" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-1">Açık Adres</label>
                                    <textarea required rows={3} value={address.addressLine} onChange={e => setAddress({ ...address, addressLine: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50 resize-none" placeholder="Mahalle, Sokak, No..." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-muted mb-1">Şehir</label>
                                        <input required type="text" value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50" placeholder="İstanbul" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-muted mb-1">Ülke</label>
                                        <input required type="text" disabled value={address.country} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed" />
                                    </div>
                                </div>
                                <button type="submit" className="w-full mt-6 bg-text-dark hover:bg-black text-white py-4 rounded-xl font-medium transition-all">
                                    Ödemeye Geç
                                </button>
                            </form>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm animate-fade-in relative overflow-hidden">
                            {isProcessing && (
                                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <p className="font-medium text-text-dark animate-pulse">Ödemeniz işleniyor, lütfen bekleyin...</p>
                                </div>
                            )}

                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-text-dark flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">2</span>
                                    Ödeme Bilgileri
                                </h2>
                                <button onClick={() => setStep(1)} className="text-sm font-medium text-text-muted hover:text-primary transition-colors">
                                    Bilgileri Düzenle
                                </button>
                            </div>

                            {/* MOCK CREDIT CARD UI */}
                            <div className="bg-gray-900 text-white p-6 rounded-2xl relative overflow-hidden shadow-2xl group transition-all duration-300 hover:shadow-primary/20">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/30 transition-all duration-500"></div>

                                <div className="relative z-10 space-y-6">
                                    <div className="flex justify-between items-center opacity-80">
                                        <svg className="w-12 h-8 opacity-80" viewBox="0 0 48 32" fill="none">
                                            <rect x="0" y="0" width="48" height="32" rx="4" fill="#ffffff" fillOpacity="0.1"/>
                                            <circle cx="16" cy="16" r="8" fill="#EB001B"/>
                                            <circle cx="32" cy="16" r="8" fill="#F79E1B"/>
                                        </svg>
                                        <span className="font-mono text-sm tracking-widest text-primary-200">DEMO BANK</span>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Kart Numarası</label>
                                        <div className="font-mono text-xl tracking-widest">**** **** **** 4242</div>
                                    </div>

                                    <div className="flex justify-between pt-2">
                                        <div>
                                            <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Kart Sahibi</label>
                                            <div className="font-medium truncate max-w-[150px]">{address.fullName || "MÜŞTERİ"}</div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">SKT</label>
                                            <div className="font-mono">12/28</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-blue-50 text-blue-800 rounded-xl text-sm mb-6 flex items-start gap-3">
                                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <p>Bu bir demo platformudur. Gerçek kredi kartı bilgilerinizi girmenize gerek yoktur. Aşağıdaki butona tıkladığınızda ödeme senaryosu <b>otomatik olarak simüle</b> edilecektir.</p>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={isProcessing || cartItems.length === 0}
                                className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 transition-all flex items-center justify-center gap-3 relative overflow-hidden"
                            >
                                {isProcessing ? (
                                    <>
                                        <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Güvenli Ödeme İşleniyor...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                        </svg>
                                        Siparişi Tamamla
                                    </>
                                )}
                                <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full hover:animate-[shimmer_1.5s_infinite]"></div>
                            </button>
                        </div>
                    )}

                </div>

                {/* Right Sidebar - Mini Summary */}
                <div className="md:w-1/3">
                    <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 sticky top-24">
                        <h3 className="font-bold text-text-dark mb-4">Sepet Özeti ({cartItems.length} Ürün)</h3>

                        <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {cartItems.map(item => (
                                <div key={item.id} className="flex gap-3 text-sm">
                                    <div className="relative w-12 h-16 rounded-md overflow-hidden bg-gray-200 flex-shrink-0">
                                        <NextImage src={getValidImageUrl(item.imageUrl)} alt={item.name} fill className="object-cover" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-medium text-text-dark line-clamp-1">{item.name}</p>
                                        <p className="text-text-muted mt-1">{item.quantity} Adet x {formatPrice(item.price)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-gray-200 space-y-2 text-sm">
                            <div className="flex justify-between text-text-muted">
                                <span>Ara Toplam</span>
                                <span>{formatPrice(cartTotal)}</span>
                            </div>
                            <div className="flex justify-between text-text-muted">
                                <span>Kargo</span>
                                <span>{cartTotal > 1500 ? 'Bedava' : formatPrice(49.90)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg text-text-dark pt-2 mt-2 border-t border-gray-200">
                                <span>Toplam</span>
                                <span className="text-primary">{formatPrice(finalTotal)}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
