"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Confetti from "react-confetti";

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        setDimensions({
            width: window.innerWidth,
            height: window.innerHeight,
        });
    }, []);

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 relative overflow-hidden">
            {dimensions.width > 0 && (
                <Confetti
                    width={dimensions.width}
                    height={dimensions.height}
                    recycle={false}
                    numberOfPieces={400}
                    colors={['#10B981', '#3B82F6', '#60A5FA', '#34D399']}
                />
            )}

            <div className="bg-white p-10 md:p-14 rounded-3xl border border-gray-100 shadow-xl text-center max-w-lg w-full relative z-10 animate-fade-in-up">

                {/* Animated Checkmark */}
                <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h1 className="text-3xl font-extrabold text-text-dark mb-4">Siparişiniz Alındı!</h1>
                <p className="text-text-muted mb-8 leading-relaxed">
                    Harika seçimler yaptınız! Siparişiniz başarıyla oluşturuldu ve en kısa sürede hazırlanarak kargoya teslim edilecek. Müşteri temsilcimiz detaylar için sizinle iletişime geçebilir.
                </p>

                <div className="bg-gray-50 rounded-2xl p-4 mb-8 text-sm font-mono text-text-dark border border-gray-100 flex justify-between items-center">
                    <span className="text-text-muted uppercase text-xs font-sans tracking-wide">Sipariş No:</span>
                    <b>#{orderId || "İşleniyor..."}</b>
                </div>

                <Link href="/">
                    <button className="w-full bg-text-dark hover:bg-black text-white px-8 py-4 rounded-xl font-medium transition-all shadow-md">
                        Alışverişe Devam Et
                    </button>
                </Link>
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="animate-pulse text-text-muted">Yükleniyor...</div>
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
