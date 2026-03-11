"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, cartTotal, cartCount, clearCart } = useCart();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(amount);
    };

    const getValidImageUrl = (url: string) => {
        if (!url) return "https://via.placeholder.com/500";
        if (url.startsWith("http://") || url.startsWith("https://")) return url;
        const backendOrigin = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5143";
        const cleanUrl = url.startsWith("/") ? url : `/${url}`;
        return `${backendOrigin}${cleanUrl}`;
    };

    if (!mounted) {
        return <div className="min-h-[70vh] flex items-center justify-center">Yükleniyor...</div>;
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
                <div className="w-24 h-24 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                </div>
                <h2 className="text-3xl font-bold text-text-dark mb-4">Sepetiniz Boş</h2>
                <p className="text-text-muted mb-8 max-w-md">
                    Görünüşe göre sepetinizde henüz hiç ürün yok. En yeni koleksiyonlarımızı keşfetmeye ne dersiniz?
                </p>
                <Link href="/products">
                    <button className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-full font-medium transition-all shadow-sm shadow-primary/20 hover:shadow-md">
                        Alışverişe Başla
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
            <h1 className="text-3xl md:text-4xl font-extrabold text-text-dark tracking-tight mb-8">
                Alışveriş Sepeti ({cartCount} Ürün)
            </h1>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Cart Items List */}
                <div className="lg:w-2/3">
                    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-100">
                            <span className="font-semibold text-text-dark">Ürün Detayları</span>
                            <button
                                onClick={clearCart}
                                className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
                            >
                                Tümünü Temizle
                            </button>
                        </div>

                        <div className="space-y-6">
                            {cart.map((item, index) => (
                                <div key={`${item.id}-${item.size || ''}-${item.color || ''}-${index}`} className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                                    {/* Product Image */}
                                    <div className="relative w-24 h-32 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                                        <Image
                                            src={getValidImageUrl(item.imageUrl)}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-grow flex flex-col justify-between h-full w-full">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-semibold text-text-dark">{item.name}</h3>
                                                <div className="flex gap-3 mt-1">
                                                    {item.size && <span className="text-xs bg-gray-100 text-text-muted px-2 py-0.5 rounded-md">Beden: {item.size}</span>}
                                                    {item.color && <span className="text-xs bg-gray-100 text-text-muted px-2 py-0.5 rounded-md">Renk: {item.color}</span>}
                                                </div>
                                                <p className="text-sm text-text-muted mt-1">
                                                    {formatPrice(item.price)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 hover:bg-red-50 rounded-lg"
                                                title="Sil"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>

                                        <div className="flex justify-between items-center mt-4">
                                            {/* Quantity Control */}
                                            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="px-3 py-1.5 text-text-dark hover:bg-gray-200 transition-colors"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    -
                                                </button>
                                                <span className="w-10 text-center font-medium text-sm">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="px-3 py-1.5 text-text-dark hover:bg-gray-200 transition-colors disabled:opacity-40"
                                                    disabled={item.quantity >= (item.stockQuantity || 99)}
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <div className="text-lg font-bold text-text-dark">
                                                {formatPrice(item.price * item.quantity)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:w-1/3">
                    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm sticky top-24">
                        <h3 className="text-xl font-bold text-text-dark mb-6">Sipariş Özeti</h3>

                        <div className="space-y-4 text-sm mb-6">
                            <div className="flex justify-between text-text-muted">
                                <span>Ara Toplam</span>
                                <span>{formatPrice(cartTotal)}</span>
                            </div>
                            <div className="flex justify-between text-text-muted">
                                <span>Kargo Tutarı</span>
                                <span>{cartTotal > 1500 ? 'Bedava' : formatPrice(49.90)}</span>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-base font-bold text-text-dark">Genel Toplam</span>
                                    <span className="text-2xl font-black text-primary">
                                        {formatPrice(cartTotal + (cartTotal > 1500 ? 0 : 49.9))}
                                    </span>
                                </div>
                                {cartTotal < 1500 && (
                                    <p className="text-xs text-text-muted mt-2">
                                        {formatPrice(1500 - cartTotal)} daha alışveriş yapın, kargo bedava olsun!
                                    </p>
                                )}
                            </div>
                        </div>

                        <Link href="/checkout">
                            <button className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-xl font-bold text-lg transition-all shadow-sm shadow-primary/20 hover:shadow-md hover:-translate-y-0.5">
                                Alışverişi Tamamla
                            </button>
                        </Link>

                        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-text-muted">
                            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span>256-bit SSL ile güvenli ödeme</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
