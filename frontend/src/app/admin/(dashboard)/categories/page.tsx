"use client";
import { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX } from "react-icons/fi";

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ name: "", description: "", parentCategoryId: "" as number | string });
    const [formLoading, setFormLoading] = useState(false);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/categories");
            const data = await res.json();
            if (data.isSuccess) {
                const cats = Array.isArray(data.data)
                    ? data.data
                    : (data.data?.data || data.data?.items || []);
                setCategories(cats);
            }
        } catch (error) {
            console.error("Kategoriler çekilemedi:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openAddModal = () => {
        setFormData({ name: "", description: "", parentCategoryId: "" });
        setIsEditing(false);
        setCurrentId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (cat: any) => {
        setFormData({
            name: cat.name,
            description: cat.description || "",
            parentCategoryId: cat.parentCategoryId || ""
        });
        setIsEditing(true);
        setCurrentId(cat.id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) return;

        try {
            const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
            const res = await fetch(`/api/categories/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.isSuccess) {
                setCategories(categories.filter(c => c.id !== id));
            } else {
                alert(data.message || "Silme başarısız.");
            }
        } catch (error) {
            console.error("Kategori silinemedi:", error);
            alert("Silme işlemi sırasında hata oluştu.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
        const url = isEditing && currentId ? `/api/categories/${currentId}` : "/api/categories";
        const method = isEditing ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    imageUrl: "", // Şimdilik boş
                    displayOrder: 0,
                    parentCategoryId: formData.parentCategoryId ? parseInt(formData.parentCategoryId as string) : null
                })
            });

            const data = await res.json();
            if (data.isSuccess) {
                if (isEditing) {
                    setCategories(categories.map(c => c.id === currentId ? data.data : c));
                } else {
                    setCategories([...categories, data.data]);
                }
                setIsModalOpen(false);
            } else {
                alert(data.message || "İşlem başarısız.");
            }
        } catch (error) {
            console.error("İşlem sırasında hata:", error);
            alert("Kategori kaydedilemedi.");
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in relative">
            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-neutral-900 border border-neutral-700/50 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">
                                {isEditing ? "Kategori Düzenle" : "Yeni Kategori Ekle"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white transition-colors">
                                <FiX size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-2">Kategori Adı</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-[#d4af37] transition-colors"
                                />
                            </div>
                            {/* Removed Parent Category Selection to keep it Flat */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-2">Kategori Açıklaması</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-[#d4af37] transition-colors resize-y"
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={formLoading}
                                className="w-full mt-4 bg-[#d4af37] hover:bg-[#b5952f] disabled:opacity-50 text-black font-medium py-3 rounded-xl transition-all shadow-lg"
                            >
                                {formLoading ? "Kaydediliyor..." : "Kaydet"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Kategoriler</h1>
                    <p className="text-neutral-400 mt-1">Mağazanızdaki tüm ürün kategorilerini yönetin.</p>
                </div>
                <button onClick={openAddModal} className="bg-[#d4af37] hover:bg-[#b5952f] text-black font-medium py-2.5 px-5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#d4af37]/20">
                    <FiPlus size={20} />
                    Yeni Kategori Ekle
                </button>
            </div>

            <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
                <div className="p-4 border-b border-neutral-700/50 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiSearch className="text-neutral-500" />
                        </div>
                        <input
                            type="text"
                            placeholder="Kategori ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-[#d4af37] transition-colors"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-900/50 border-b border-neutral-700/50 text-neutral-400 text-sm font-medium">
                                <th className="p-4 whitespace-nowrap">ID</th>
                                <th className="p-4">Kategori Adı</th>
                                <th className="p-4">Açıklama</th>
                                <th className="p-4 whitespace-nowrap text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-700/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-neutral-500">
                                        <div className="animate-pulse flex items-center justify-center gap-2">
                                            Kategoriler yükleniyor...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-neutral-500">
                                        Kategori bulunamadı.
                                    </td>
                                </tr>
                            ) : (
                                filteredCategories.map((category) => (
                                    <tr key={category.id} className="hover:bg-neutral-800/30 transition-colors group">
                                        <td className="p-4 text-neutral-400">#{category.id}</td>
                                        <td className="p-4 font-medium">{category.name}</td>
                                        <td className="p-4 text-neutral-400 max-w-xs truncate">{category.description || '-'}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openEditModal(category)} className="p-2 text-neutral-400 hover:text-[#d4af37] hover:bg-[#d4af37]/10 rounded-lg transition-all" title="Düzenle">
                                                    <FiEdit2 size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(category.id)} className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all" title="Sil">
                                                    <FiTrash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
