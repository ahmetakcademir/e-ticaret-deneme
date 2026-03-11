"use client";

import React, { useEffect, useState, Suspense } from "react";
import ProductCard from "@/components/product/ProductCard";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";

interface Product {
    id: number;
    name: string;
    price: number;
    discountedPrice: number | null;
    imageUrls: string[];
    categoryId: number;
    description: string;
}

function ProductsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialCategory = searchParams.get("category"); // 'kadin' or 'erkek'
    const searchQuery = searchParams.get("search") || "";

    // Kategori ve Filtre State Yönetimi (Top-level)
    // Tümü yok artık. Sadece 'kadin' veya 'erkek' ana kategorimiz üzerinden ürün gösteriyoruz.
    const [activeBaseCategory, setActiveBaseCategory] = useState<"kadin" | "erkek">(
        initialCategory === "erkek" ? "erkek" : "kadin"
    );
    // Sub-filtre (Kış Koleksiyonu, Essentials, vd. veya hiçbiri için 'Yok')
    const [activeSubFilter, setActiveSubFilter] = useState<string>("Yok");

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState<string>("En Yeniler");

    // Initialize from URL parameter if present
    useEffect(() => {
        if (initialCategory === "kadin" || initialCategory === "erkek") {
            setActiveBaseCategory(initialCategory);
            setActiveSubFilter("Yok"); // Kategori değiştiğinde alt filtreyi sıfırla
        }
    }, [initialCategory]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`/api/Products`);
                if (response.ok) {
                    const result = await response.json();
                    const items = Array.isArray(result.data) ? result.data : (result.data?.data || result.data?.items || []);
                    setProducts(items);
                }
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // 1. BASE CATEGORY FILTERING (Sıkı İzolasyon)
    let baseFilteredProducts: Product[];

    // If searching, search across ALL products (not just one category)
    if (searchQuery) {
        baseFilteredProducts = products.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    } else {
        baseFilteredProducts = products.filter(p => activeBaseCategory === "kadin" ? p.categoryId === 1 : p.categoryId === 2);
    }

    // 2. SUB-FILTERING applying OVER the Base Category (Kış, Essentials etc.) using Descriptions
    let filteredProducts = baseFilteredProducts;
    if (activeSubFilter === "Kış Koleksiyonu") {
        filteredProducts = baseFilteredProducts.filter(p => p.description && p.description.includes("Kış Koleksiyonu"));
    } else if (activeSubFilter === "Gündelik Temel (Essentials)") {
        filteredProducts = baseFilteredProducts.filter(p => p.description && p.description.includes("Essentials Koleksiyonu"));
    } else if (activeSubFilter === "Gece Şıklığı" || activeSubFilter === "Özel Davet") {
        filteredProducts = baseFilteredProducts.filter(p => p.description && (p.description.includes("Gece Koleksiyonu") || p.description.includes("Davet Koleksiyonu")));
    }

    // Sorting Logic
    if (sortOrder === "Fiyat: Artan") {
        filteredProducts = [...filteredProducts].sort((a, b) => {
            const priceA = a.discountedPrice ?? a.price;
            const priceB = b.discountedPrice ?? b.price;
            return priceA - priceB;
        });
    } else if (sortOrder === "Fiyat: Azalan") {
        filteredProducts = [...filteredProducts].sort((a, b) => {
            const priceA = a.discountedPrice ?? a.price;
            const priceB = b.discountedPrice ?? b.price;
            return priceB - priceA;
        });
    }

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    // Dinamik Koleksiyon İçerikleri
    const womensCollections = [
        { title: "Kış Koleksiyonu", desc: "Soğuk günlerde elit bir şıklık ve zarif detaylar.", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop" },
        { title: "Gündelik Temel (Essentials)", desc: "Soft tonlar ve minimalist kesimlerle kurtarıcı parçalar.", img: "https://images.unsplash.com/photo-1618244972963-cb601d51a02f?w=800&auto=format&fit=crop" },
        { title: "Gece Şıklığı", desc: "Özel davetlerde göz kamaştıran sade ve asil tasarımlar.", img: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&auto=format&fit=crop" }
    ];

    const mensCollections = [
        { title: "Kış Koleksiyonu", desc: "Sıcak tutan maskülen ve minimal kışlık dış giyim.", img: "https://images.unsplash.com/photo-1520975954732-57dd22299614?w=800&auto=format&fit=crop" },
        { title: "Gündelik Temel (Essentials)", desc: "Rahat, net çizgiler ve zamansız basic tasarımlar.", img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop" },
        { title: "Özel Davet", desc: "Ciddiyetin ve karizmanın yansıması jilet gibi takımlar.", img: "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?w=800&auto=format&fit=crop" }
    ];

    const activeCollectionsData = activeBaseCategory === "kadin" ? womensCollections : mensCollections;

    const handleCollectionClick = (title: string) => {
        if (activeSubFilter === title) {
            setActiveSubFilter("Yok"); // Toggle off
        } else {
            setActiveSubFilter(title);
        }
        // Smooth scroll to products area
        document.getElementById("products-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Özel Koleksiyonlar Banner Alanı */}
            <section className="pt-12 pb-16 px-4 max-w-7xl mx-auto">
                <div className="text-center mb-6">
                    <div className="inline-flex bg-gray-100 rounded-full p-1 mb-8">
                        <button
                            onClick={() => { setActiveBaseCategory("kadin"); setActiveSubFilter("Yok"); }}
                            className={`px-8 py-2 rounded-full font-semibold transition-all duration-300 ${activeBaseCategory === "kadin" ? "bg-white text-text-dark shadow-sm" : "text-gray-500 hover:text-text-dark"}`}
                        >
                            Kadın
                        </button>
                        <button
                            onClick={() => { setActiveBaseCategory("erkek"); setActiveSubFilter("Yok"); }}
                            className={`px-8 py-2 rounded-full font-semibold transition-all duration-300 ${activeBaseCategory === "erkek" ? "bg-white text-text-dark shadow-sm" : "text-gray-500 hover:text-text-dark"}`}
                        >
                            Erkek
                        </button>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-extrabold text-text-dark tracking-tight mb-4 transition-colors duration-500">
                        {activeBaseCategory === "kadin" ? "Kadın Koleksiyonları" : "Erkek Koleksiyonları"}
                    </h1>
                    <p className="text-lg text-text-muted max-w-2xl mx-auto">
                        Tarzınıza ve mevsime en uygun, {activeBaseCategory === "kadin" ? "hanımefendiler" : "beyefendiler"} için özenle bir araya getirilmiş özel konseptlerimizi keşfedin.
                    </p>
                </div>

                <motion.div
                    key={activeBaseCategory} // Force re-animation on category switch
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    {activeCollectionsData.map((col, idx) => (
                        <div
                            key={idx}
                            onClick={() => handleCollectionClick(col.title)}
                            className={`group relative h-80 rounded-2xl overflow-hidden cursor-pointer shadow-md transition-all duration-500 ${activeSubFilter === col.title ? 'ring-4 ring-primary ring-offset-2 scale-[1.02]' : ''}`}
                        >
                            <Image src={col.img} alt={col.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                            <div className={`absolute inset-0 bg-gradient-to-t ${activeSubFilter === col.title ? 'from-primary/90 via-black/40' : 'from-black/80 via-black/20'} to-transparent transition-colors duration-500 opacity-90 group-hover:opacity-100`}></div>

                            <div className="absolute bottom-0 left-0 p-8 w-full transform transition-transform duration-500 group-hover:-translate-y-4">
                                <h3 className="text-2xl font-bold text-white mb-3 tracking-wide">{col.title}</h3>
                                <div className="h-0 overflow-hidden transition-all duration-500 group-hover:h-12">
                                    <p className={`text-sm text-gray-200 transform translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 ${activeSubFilter === col.title ? 'text-white font-medium' : ''}`}>
                                        {col.desc}
                                    </p>
                                </div>
                            </div>

                            {/* Checkmark for Active State */}
                            {activeSubFilter === col.title && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-4 right-4 bg-white text-primary rounded-full p-2 shadow-lg"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </motion.div>
                            )}
                        </div>
                    ))}
                </motion.div>
            </section>

            {/* Tüm Ürünler Alanı */}
            <section id="products-grid" className="py-16 px-4 bg-gray-50 border-t border-gray-100 min-h-screen transition-colors duration-700">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
                        <div className="flex items-center gap-4 flex-wrap">
                            <h2 className="text-3xl font-bold text-text-dark capitalize">
                                {searchQuery
                                    ? `"${searchQuery}" için ${filteredProducts.length} sonuç`
                                    : activeSubFilter === "Yok"
                                        ? `Tüm ${activeBaseCategory === "kadin" ? "Kadın" : "Erkek"} Parçaları`
                                        : `${activeSubFilter} (${activeBaseCategory === "kadin" ? "Kadın" : "Erkek"})`}
                            </h2>
                            {searchQuery && (
                                <button
                                    onClick={() => router.push("/products")}
                                    className="text-sm font-medium text-red-500 hover:text-red-700 bg-red-50 px-3 py-1 rounded-full transition-colors"
                                >
                                    ✕ Aramayı Temizle
                                </button>
                            )}
                            {!searchQuery && activeSubFilter !== "Yok" && (
                                <button
                                    onClick={() => setActiveSubFilter("Yok")}
                                    className="text-sm font-medium text-red-500 hover:text-red-700 underline transition-colors"
                                >
                                    Filtreyi Temizle
                                </button>
                            )}
                        </div>
                        <div className="flex gap-4">
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="bg-white border border-gray-200 text-text-dark text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 outline-none shadow-sm cursor-pointer hover:border-gray-300 transition-colors"
                            >
                                <option>En Yeniler</option>
                                <option>Fiyat: Artan</option>
                                <option>Fiyat: Azalan</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="animate-pulse bg-white border border-gray-100 rounded-2xl p-4 h-96 flex flex-col">
                                    <div className="w-full h-4/5 bg-gray-200 rounded-xl mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            key={`${activeBaseCategory}-${activeSubFilter}-${sortOrder}`} // Force re-animation on filter/sort change
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                        >
                            {filteredProducts.map((product) => (
                                <motion.div key={product.id} variants={itemVariants}>
                                    <ProductCard
                                        id={product.id}
                                        name={product.name}
                                        price={product.price}
                                        imageUrl={product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : ""}
                                        discountedPrice={product.discountedPrice}
                                    />
                                </motion.div>
                            ))}
                            {filteredProducts.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                    className="col-span-full flex flex-col items-center justify-center py-20"
                                >
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-xl text-text-dark font-medium">
                                        {searchQuery ? `"${searchQuery}" için sonuç bulunamadı.` : "Bu filtreye uygun ürün bulunamadı."}
                                    </p>
                                    <button
                                        onClick={() => {
                                            setActiveSubFilter("Yok");
                                            if (searchQuery) {
                                                router.push("/products");
                                            }
                                        }}
                                        className="mt-4 px-6 py-2.5 bg-primary text-white rounded-full font-medium hover:bg-primary-hover transition-all shadow-sm"
                                    >
                                        Tüm Koleksiyonu Görüntüle
                                    </button>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </div>
            </section>
        </div>
    );
}

// Ensure the page builds statically without bailing out on useSearchParams
export default function ProductsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent flex rounded-full animate-spin"></div>
            </div>
        }>
            <ProductsContent />
        </Suspense>
    );
}
