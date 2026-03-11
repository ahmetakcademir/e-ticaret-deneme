"use client";
import { useState, useEffect } from "react";
import { FiSave, FiUser, FiGlobe, FiBell, FiShield } from "react-icons/fi";

type TabT = "general" | "account" | "security" | "notifications";

export default function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState<TabT>("general");
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Form States - defaults
    const [storeName, setStoreName] = useState("Deniyorum Butiği");
    const [contactEmail, setContactEmail] = useState("iletisim@butik.com");
    const [storeDescription, setStoreDescription] = useState("Minimalist ve şık tasarımlarla tarzınızı yansıtın.");

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem("admin_settings");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.storeName) setStoreName(parsed.storeName);
                if (parsed.contactEmail) setContactEmail(parsed.contactEmail);
                if (parsed.storeDescription) setStoreDescription(parsed.storeDescription);
            }
        } catch (e) { /* ignore */ }
    }, []);

    const handleSave = () => {
        setIsSaving(true);
        setSaveSuccess(false);
        // Save to localStorage
        setTimeout(() => {
            localStorage.setItem("admin_settings", JSON.stringify({
                storeName,
                contactEmail,
                storeDescription
            }));
            setIsSaving(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        }, 500);
    };

    const renderContent = () => {
        switch (activeTab) {
            case "general":
                return (
                    <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-2xl p-6 shadow-xl backdrop-blur-sm animate-fade-in">
                        <h2 className="text-xl font-bold text-white mb-6">Genel Mağaza Ayarları</h2>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-2">Mağaza Adı</label>
                                <input
                                    type="text"
                                    value={storeName}
                                    onChange={(e) => setStoreName(e.target.value)}
                                    className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-[#d4af37] transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-2">İletişim E-postası</label>
                                <input
                                    type="email"
                                    value={contactEmail}
                                    onChange={(e) => setContactEmail(e.target.value)}
                                    className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-[#d4af37] transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-2">Mağaza Açıklaması (Tasarım)</label>
                                <textarea
                                    rows={3}
                                    value={storeDescription}
                                    onChange={(e) => setStoreDescription(e.target.value)}
                                    className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-[#d4af37] transition-colors resize-y"
                                ></textarea>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end items-center gap-4">
                            {saveSuccess && <span className="text-emerald-400 text-sm font-medium animate-fade-in">Değişiklikler kaydedildi!</span>}
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-[#d4af37] hover:bg-[#b5952f] disabled:opacity-50 text-black font-medium py-2.5 px-6 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-[#d4af37]/20"
                            >
                                <FiSave size={18} />
                                {isSaving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                            </button>
                        </div>
                    </div>
                );
            case "account":
                return (
                    <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-2xl p-6 shadow-xl backdrop-blur-sm animate-fade-in">
                        <h2 className="text-xl font-bold text-white mb-6">Hesap Ayarları</h2>
                        <div className="text-neutral-400">Hesap bilgilerinizi buradan güncelleyebilirsiniz. (Örnek İçerik)</div>
                    </div>
                );
            case "security":
                return (
                    <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-2xl p-6 shadow-xl backdrop-blur-sm animate-fade-in">
                        <h2 className="text-xl font-bold text-white mb-6">Güvenlik Ayarları</h2>
                        <div className="text-neutral-400">Şifre değiştirme ve iki faktörlü doğrulama ayarları. (Örnek İçerik)</div>
                    </div>
                );
            case "notifications":
                return (
                    <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-2xl p-6 shadow-xl backdrop-blur-sm animate-fade-in">
                        <h2 className="text-xl font-bold text-white mb-6">Bildirim Ayarları</h2>
                        <div className="text-neutral-400">Hangi e-postaları almak istediğinizi seçin. (Örnek İçerik)</div>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Ayarlar</h1>
                <p className="text-neutral-400 mt-1">Mağaza ve yönetici hesabı tercihlerinizi yapılandırın.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sol Menü: Ayar Kategorileri */}
                <div className="md:col-span-1 space-y-1">
                    <button
                        onClick={() => setActiveTab("general")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'general' ? 'bg-[#d4af37]/10 text-[#d4af37]' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
                    >
                        <FiGlobe size={18} />
                        Genel
                    </button>
                    <button
                        onClick={() => setActiveTab("account")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'account' ? 'bg-[#d4af37]/10 text-[#d4af37]' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
                    >
                        <FiUser size={18} />
                        Hesap
                    </button>
                    <button
                        onClick={() => setActiveTab("security")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'security' ? 'bg-[#d4af37]/10 text-[#d4af37]' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
                    >
                        <FiShield size={18} />
                        Güvenlik
                    </button>
                    <button
                        onClick={() => setActiveTab("notifications")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'notifications' ? 'bg-[#d4af37]/10 text-[#d4af37]' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
                    >
                        <FiBell size={18} />
                        Bildirimler
                    </button>
                </div>

                {/* Sağ Taraf: Ayar Formları */}
                <div className="md:col-span-3 space-y-6">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}
