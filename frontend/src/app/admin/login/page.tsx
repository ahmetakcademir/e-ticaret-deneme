"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiLock, FiMail } from "react-icons/fi";

export default function AdminLogin() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok && data.isSuccess) {
                // Admin token'ı cookie olarak kaydet
                document.cookie = `admin_token=${data.data.token}; path=/; max-age=86400; SameSite=Strict`;
                router.push("/admin");
            } else {
                setError(data.message || "Giriş başarısız.");
            }
        } catch (err: any) {
            console.error(err);
            setError(`Sunucuya bağlanılamadı. Hata: ${err.message || 'Bilinmeyen hata'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-widest text-[#d4af37] mb-2">DENİYORUM BUTİĞİ</h1>
                    <p className="text-neutral-500 uppercase tracking-widest text-sm">Yönetici Girişi</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FiMail className="text-neutral-500" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all"
                                placeholder="E-posta Adresi"
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FiLock className="text-neutral-500" />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all"
                                placeholder="Şifre"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#d4af37] hover:bg-[#b5952f] text-black font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm mt-4"
                    >
                        {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
                    </button>

                    <div className="text-center mt-6">
                        <a href="/" className="text-neutral-500 hover:text-white text-sm transition-colors">
                            &larr; Mağazaya Dön
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}
