"use client";

import React, { useState } from "react";

export default function ContactPage() {
    const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Contact form data:", formData);
        setSubmitted(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => setSubmitted(false), 5000);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">

                {/* Sol Taraf - İletişim Bilgileri */}
                <div className="w-full md:w-5/12 bg-text-dark text-white p-10 flex flex-col justify-between">
                    <div>
                        <h2 className="text-3xl font-extrabold mb-4">Bize Ulaşın</h2>
                        <p className="text-gray-300 mb-10">
                            Koleksiyonumuz hakkında sorularınız, siparişleriniz veya işbirlikleri için buradayız. Sizinle tanışmayı sabırsızlıkla bekliyoruz.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start">
                                <svg className="w-6 h-6 text-accent mt-1 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <div>
                                    <h4 className="font-bold text-lg">Mağaza</h4>
                                    <p className="text-gray-400">Nişantaşı, Teşvikiye Cd. No:14<br />Şişli / İstanbul</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <svg className="w-6 h-6 text-accent mt-1 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <div>
                                    <h4 className="font-bold text-lg">E-Posta</h4>
                                    <p className="text-gray-400">hello@deniyorumbutigi.com</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <svg className="w-6 h-6 text-accent mt-1 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <div>
                                    <h4 className="font-bold text-lg">Telefon</h4>
                                    <p className="text-gray-400">+90 (212) 555 01 23</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12">
                        <h4 className="font-semibold mb-4 text-sm tracking-wider uppercase">Bizi Takip Edin</h4>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-accent transition-colors">
                                <span className="font-bold">IG</span>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-accent transition-colors">
                                <span className="font-bold">TW</span>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-accent transition-colors">
                                <span className="font-bold">FB</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sağ Taraf - Form */}
                <div className="w-full md:w-7/12 p-10 lg:p-14">
                    <h3 className="text-2xl font-bold text-text-dark mb-6">Mesaj Gönderin</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-text-dark mb-2">Adınız</label>
                                <input type="text" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary outline-none transition-colors" placeholder="Ahmet Yılmaz" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-dark mb-2">E-Posta Adresiniz</label>
                                <input type="email" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary outline-none transition-colors" placeholder="ahmet@ornek.com" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-dark mb-2">Konu (İsteğe Bağlı)</label>
                            <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary outline-none transition-colors" placeholder="Nasıl yardımcı olabiliriz?" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-dark mb-2">Mesajınız</label>
                            <textarea required rows={5} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary outline-none transition-colors resize-none" placeholder="Lütfen mesajınızı buraya yazın..."></textarea>
                        </div>

                        <button type="submit" className="w-full bg-text-dark hover:bg-black text-white font-medium py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                            Mesajı Gönder
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
