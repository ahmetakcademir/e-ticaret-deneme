"use client";
import { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiX, FiUpload } from "react-icons/fi";

export default function AdminProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: 0,
        costPrice: 0,
        stockQuantity: 0,
        categoryId: 0,
        isInStock: true,
        gender: "Unisex",
        imageUrls: [] as string[]
    });
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Paralel fetch (Ürünler ve Kategoriler)
            const [prodRes, catRes] = await Promise.all([
                fetch("/api/products"),
                fetch("/api/categories")
            ]);

            const prodData = await prodRes.json();
            const catData = await catRes.json();

            if (prodData.isSuccess) {
                // API may return { data: [...] } or { data: { data: [...], totalCount } }
                const items = Array.isArray(prodData.data) 
                    ? prodData.data 
                    : (prodData.data?.data || prodData.data?.items || []);
                setProducts(items);
            }
            if (catData.isSuccess) {
                const cats = Array.isArray(catData.data) 
                    ? catData.data 
                    : (catData.data?.data || catData.data?.items || []);
                setCategories(cats);
            }
        } catch (error) {
            console.error("Veri çekilemedi:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getCategoryName = (id: number) => {
        const cat = categories.find(c => c.id === id);
        return cat ? cat.name : "Kategori Yok";
    };

    const openAddModal = () => {
        setFormData({ name: "", description: "", price: 0, costPrice: 0, stockQuantity: 0, imageUrls: [], categoryId: categories.length > 0 ? categories[0].id : 0, isInStock: true, gender: "Unisex" });
        setIsEditing(false);
        setCurrentId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (prod: any) => {
        setFormData({
            name: prod.name,
            description: prod.description || "",
            price: prod.price,
            costPrice: prod.costPrice || 0,
            stockQuantity: prod.stockQuantity || 0,
            categoryId: prod.categoryId,
            isInStock: prod.isInStock !== undefined ? prod.isInStock : true,
            gender: prod.gender || "Unisex",
            imageUrls: prod.imageUrls || []
        });
        setIsEditing(true);
        setCurrentId(prod.id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;

        try {
            const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
            const res = await fetch(`/api/products/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.isSuccess) {
                setProducts(products.filter(p => p.id !== id));
            } else {
                alert(data.message || "Silme başarısız.");
            }
        } catch (error) {
            console.error("Ürün silinemedi:", error);
            alert("Silme işlemi sırasında hata oluştu.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
        const url = isEditing && currentId ? `/api/products/${currentId}` : "/api/products";
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
                    price: formData.price,
                    costPrice: formData.costPrice,
                    stockQuantity: formData.stockQuantity,
                    discountedPrice: null, // Şimdilik indirim yok
                    categoryId: formData.categoryId,
                    gender: formData.gender,
                    sizes: [],
                    colors: [],
                    imageUrls: formData.imageUrls
                })
            });

            // Yanıtın gerçekten JSON olup olmadığını kontrol et
            const textResponse = await res.text();
            let data;
            try {
                data = JSON.parse(textResponse);
            } catch (jsonError) {
                console.error("JSON Parse Hatası. Gelen Yanıt:", textResponse);
                alert("Sunucudan beklenen veri formatı gelmedi. (Detaylar konsolda)");
                return;
            }

            if (data.isSuccess) {
                if (isEditing) {
                    setProducts(products.map(p => p.id === currentId ? data.data : p));
                } else {
                    setProducts([...products, data.data]);
                }
                setIsModalOpen(false);
            } else {
                alert(data.message || "İşlem başarısız.");
            }
        } catch (error) {
            console.error("İşlem sırasında sunucu veya ağ hatası:", error);
            alert("Sunucuya bağlanılamadı veya işlem gerçekleştirilemedi.");
        } finally {
            setFormLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uploadFormData = new FormData();
        uploadFormData.append("file", file);

        try {
            const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
            // Upload directly to backend — Next.js proxy corrupts multipart/form-data
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5143/api';
            const res = await fetch(`${backendUrl}/upload`, {
                method: "POST",
                headers: {
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: uploadFormData
            });
            
            const rawText = await res.text();
            console.log("Raw upload response HTTP status:", res.status);
            console.log("Raw upload response text:", rawText);

            let data;
            try {
                data = JSON.parse(rawText);
            } catch (e) {
                console.error("Failed to parse response as JSON:", rawText);
                alert("Sunucudan geçersiz yanıt geldi (Hata kodu: " + res.status + ")");
                return;
            }

            // Backend returns: { isSuccess: true, data: { url: "/images/products/..." } }
            const uploadedUrl = data?.data?.url || data?.url;
            if (res.ok && data.isSuccess && uploadedUrl) {
                setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, uploadedUrl] }));
                alert("Görsel başarıyla yüklendi! Lütfen en alttaki 'Kaydet' butonuna basmayı unutmayın.");
            } else {
                console.error("Upload response parsed data:", data);
                alert(data?.message || data?.title || "Görsel yüklenemedi. Durum Kodu: " + res.status);
            }
        } catch (error) {
            console.error("Yükleme hatası:", error);
            alert("Görsel yüklenirken bir hata oluştu: " + String(error));
        } finally {
            // Reset input so the same file can be uploaded again if needed
            e.target.value = "";
        }
    };


    return (
        <div className="space-y-6 animate-fade-in relative">
            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-neutral-900 border border-neutral-700/50 rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in flex flex-col" style={{ maxHeight: '85vh' }} onClick={e => e.stopPropagation()}>
                        {/* Sticky Header */}
                        <div className="flex items-center justify-between p-5 pb-4 border-b border-neutral-800 flex-shrink-0">
                            <h2 className="text-lg font-bold text-white">
                                {isEditing ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-neutral-800 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-all">
                                <FiX size={18} />
                            </button>
                        </div>
                        {/* Scrollable Body */}
                        <div className="overflow-y-auto p-5 pt-4 flex-1" style={{ maxHeight: 'calc(85vh - 130px)' }}>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-2">Ürün Adı</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-[#d4af37] transition-colors"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-2">Maliyet (₺)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={formData.costPrice}
                                        onChange={e => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-[#d4af37] transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-2">Satış Fiyatı (₺)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-[#d4af37] transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-2">Kâr (₺)</label>
                                    <input
                                        type="text"
                                        disabled
                                        value={(formData.price - formData.costPrice).toFixed(2)}
                                        className="w-full bg-neutral-800/80 border border-neutral-700 text-[#d4af37] font-bold rounded-xl py-2.5 px-4 focus:outline-none cursor-not-allowed"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-2">Stok Adedi</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.stockQuantity}
                                        onChange={e => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0, isInStock: (parseInt(e.target.value) || 0) > 0 })}
                                        className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-[#d4af37] transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-2">Kategori</label>
                                    <select
                                        value={formData.categoryId}
                                        onChange={e => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                                        className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-[#d4af37] transition-colors appearance-none"
                                    >
                                        <option value={0} disabled>Kategori Seçin</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.parentCategoryId ? `${categories.find(p => p.id === c.parentCategoryId)?.name} > ` : ''}{c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-2">Bölüm (Cinsiyet)</label>
                                <select
                                    value={formData.gender}
                                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                    className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-[#d4af37] transition-colors appearance-none"
                                >
                                    <option value="Unisex">Her İkisi (Unisex)</option>
                                    <option value="Kadın">Kadın</option>
                                    <option value="Erkek">Erkek</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-2">Ürün Görselleri</label>
                                <div className="flex flex-col gap-3 mb-2">
                                    <div className="flex items-center gap-2">
                                        <label className="flex-1 flex items-center justify-center gap-2 bg-neutral-800/80 hover:bg-neutral-700/50 border border-neutral-700 hover:border-[#d4af37] text-neutral-300 hover:text-white cursor-pointer rounded-xl py-2.5 px-4 transition-all text-sm font-medium border-dashed">
                                            <FiUpload size={18} className="text-[#d4af37]" />
                                            Bilgisayardan Yükle
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageUpload}
                                            />
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-full h-[1px] bg-neutral-800"></div>
                                        <span className="text-xs text-neutral-500 font-medium px-2">VEYA URL İLE</span>
                                        <div className="w-full h-[1px] bg-neutral-800"></div>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            id="newImageUrl"
                                            placeholder="Görsel URL'si yapıştırın (örn: https://...)"
                                            className="flex-1 bg-neutral-800 border border-neutral-700 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-[#d4af37] transition-colors text-sm"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const input = e.currentTarget;
                                                    if (input.value.trim()) {
                                                        setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, input.value.trim()] }));
                                                        input.value = '';
                                                    }
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const input = document.getElementById('newImageUrl') as HTMLInputElement;
                                                if (input && input.value.trim()) {
                                                    setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, input.value.trim()] }));
                                                    input.value = '';
                                                }
                                            }}
                                            className="bg-neutral-700 hover:bg-neutral-600 px-4 py-2.5 rounded-xl text-white transition-colors text-sm font-medium shadow-md whitespace-nowrap"
                                        >URL Ekle</button>
                                    </div>
                                </div>
                                {formData.imageUrls.length > 0 && (
                                    <div className="flex flex-wrap gap-3 mt-3">
                                        {formData.imageUrls.map((url, idx) => (
                                            <div key={idx} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-neutral-600 shadow-md">
                                                <img src={url} alt={`img-${idx}`} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, imageUrls: prev.imageUrls.filter((_, i) => i !== idx) }))}
                                                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-red-400"
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-2">Açıklama</label>
                                <textarea
                                rows={2}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-[#d4af37] transition-colors resize-y"
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={formLoading}
                                className="w-full bg-[#d4af37] hover:bg-[#b5952f] disabled:opacity-50 text-black font-medium py-3 rounded-xl transition-all shadow-lg"
                            >
                                {formLoading ? "Kaydediliyor..." : "Kaydet"}
                            </button>
                        </form>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Ürünler</h1>
                    <p className="text-neutral-400 mt-1">Sistemdeki tüm ürünlerinizi listeleyin ve yönetin.</p>
                </div>
                <button onClick={openAddModal} className="bg-[#d4af37] hover:bg-[#b5952f] text-black font-medium py-2.5 px-5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#d4af37]/20">
                    <FiPlus size={20} />
                    Yeni Ürün Ekle
                </button>
            </div>

            <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
                <div className="p-4 border-b border-neutral-700/50 flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative flex-1 w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center cursor-pointer" onClick={() => document.getElementById('searchProductInput')?.focus()}>
                            <FiSearch className="text-neutral-500 hover:text-[#d4af37] transition-colors" />
                        </div>
                        <input
                            id="searchProductInput"
                            type="text"
                            placeholder="Ürün adı ile ara..."
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

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-900/50 border-b border-neutral-700/50 text-neutral-400 text-sm font-medium">
                                <th className="p-4 whitespace-nowrap">ID</th>
                                <th className="p-4">Ürün Adı</th>
                                <th className="p-4">Kategori</th>
                                <th className="p-4">Fiyat</th>
                                <th className="p-4 text-center">Stok Durumu</th>
                                <th className="p-4 whitespace-nowrap text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-700/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-neutral-500">
                                        <div className="animate-pulse flex items-center justify-center gap-2">Ürünler yükleniyor...</div>
                                    </td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-neutral-500">
                                        Eşleşen ürün bulunamadı.
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-neutral-800/30 transition-colors group">
                                        <td className="p-4 text-neutral-400">#{product.id}</td>
                                        <td className="p-4 font-medium flex items-center gap-3">
                                            <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center border border-neutral-700 flex-shrink-0 overflow-hidden">
                                                {product.imageUrls && product.imageUrls.length > 0 ? (
                                                    <img
                                                        src={(() => {
                                                            const url = product.imageUrls[0];
                                                            if (!url) return "";
                                                            if (url.startsWith("http://") || url.startsWith("https://")) return url;
                                                            return `http://localhost:5143${url.startsWith("/") ? url : "/" + url}`;
                                                        })()}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                    />
                                                ) : (
                                                    <span className="text-neutral-600 text-xs font-bold">{product.name?.charAt(0)?.toUpperCase()}</span>
                                                )}
                                            </div>
                                            {product.name}
                                        </td>
                                        <td className="p-4 text-neutral-400">{getCategoryName(product.categoryId)}</td>
                                        <td className="p-4 font-medium text-[#d4af37]">₺{product.price.toFixed(2)}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${product.isInStock ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                                {product.isInStock ? 'Stokta Var' : 'Tükendi'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openEditModal(product)} className="p-2 text-neutral-400 hover:text-[#d4af37] hover:bg-[#d4af37]/10 rounded-lg transition-all" title="Düzenle">
                                                    <FiEdit2 size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(product.id)} className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all" title="Sil">
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
