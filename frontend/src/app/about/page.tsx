import React from "react";
import Image from "next/image";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative py-20 bg-gray-50 overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h1 className="text-5xl font-extrabold text-text-dark tracking-tight mb-6">Biz Kimiz?</h1>
                    <p className="text-xl text-text-muted max-w-2xl mx-auto">
                        Sürdürülebilir zarafeti ve zamansız tasarımları ulaşılabilir kılan bir moda durağı.
                    </p>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-center gap-16">
                    <div className="w-full md:w-1/2 relative">
                        <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative z-10">
                            <Image
                                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop"
                                alt="Moda Atölyesi"
                                fill
                                className="object-cover"
                            />
                        </div>
                        {/* Dekoratif Arka Plan Bloğu */}
                        <div className="absolute -bottom-6 -left-6 w-full h-full bg-accent/20 rounded-3xl z-0"></div>
                    </div>

                    <div className="w-full md:w-1/2 space-y-6">
                        <h2 className="text-sm font-bold text-primary tracking-widest uppercase">Hikayemiz</h2>
                        <h3 className="text-4xl font-bold text-text-dark leading-snug">DeniyorumButiği'nin Doğuşu</h3>
                        <p className="text-lg text-text-muted leading-relaxed">
                            Her şey tek bir mottomuzla başladı: <strong className="text-text-dark">"Şıklık Sadelikte Gizlidir."</strong> Moda sektörünün karmaşık ve hızlı tüketime dayalı dünyasından sıyrılarak, gardıropların yapıtaşı olacak temel, kaliteli ve sade parçaları bir araya getirmeyi hayal ettik.
                        </p>
                        <p className="text-lg text-text-muted leading-relaxed">
                            Kumaş seçimlerimizden dikiş detaylarına kadar her aşamada kaliteyi ön planda tutuyor, doğaya saygılı üretim süreçlerini destekleyen parçaları koleksiyonlarımıza katıyoruz.
                        </p>

                        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-gray-100 mt-8">
                            <div>
                                <h4 className="text-3xl font-extrabold text-text-dark mb-2">10K+</h4>
                                <p className="text-text-muted">Mutlu Müşteri</p>
                            </div>
                            <div>
                                <h4 className="text-3xl font-extrabold text-text-dark mb-2">%100</h4>
                                <p className="text-text-muted">Kalite Güvencesi</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="bg-text-dark text-white py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-16">Değerlerimiz</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-4">Zamansız Tasarım</h3>
                            <p className="text-gray-400">Modası geçmeyen, yıllarca giyebileceğiniz klasik formlar sunuyoruz.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-4">Üstün Kalite</h3>
                            <p className="text-gray-400">Her bir ürünü, dokusuna ve kalıbına özen göstererek seçiyoruz.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-4">Sürdürülebilirlik</h3>
                            <p className="text-gray-400">Doğaya dost malzemelerle üretilen çevreye duyarlı bir yaklaşımı benimsiyoruz.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
