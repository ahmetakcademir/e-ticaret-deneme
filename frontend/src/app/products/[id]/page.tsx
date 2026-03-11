"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { use } from "react";

interface ProductDetail {
    id: number;
    name: string;
    slug: string;
    price: number;
    discountedPrice: number | null;
    costPrice: number;
    isInStock: boolean;
    stockQuantity: number;
    gender: string;
    description: string | null;
    metaTitle: string | null;
    metaDescription: string | null;
    categoryId: number;
    categoryName: string | null;
    imageUrls: string[];
    sizes?: string[];
    colors?: string[];
    careInstructions?: string;
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // UI State
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);
    const [imgError, setImgError] = useState<Record<number, boolean>>({});

    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`/api/Products/${id}`);
                if (!response.ok) {
                    setError("Ürün bulunamadı.");
                    return;
                }
                const result = await response.json();
                if (result.isSuccess && result.data) {
                    setProduct(result.data);
                } else {
                    setError("Ürün bulunamadı.");
                }
            } catch (err) {
                console.error("Failed to fetch product:", err);
                setError("Ürün yüklenirken bir hata oluştu.");
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(amount);
    };

    const getValidImageUrl = (url: string) => {
        if (!url) return "";
        if (url.startsWith("http://") || url.startsWith("https://")) return url;
        
        // Ensure absolute URL so next/image can optimize it from external source
        const backendOrigin = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5143";
        const cleanUrl = url.startsWith("/") ? url : `/${url}`;
        return `${backendOrigin}${cleanUrl}`;
    };

    const handleAddToCart = () => {
        if (!product) return;

        addToCart({
            id: product.id,
            name: product.name,
            price: product.discountedPrice ?? product.price,
            quantity,
            imageUrl: product.imageUrls?.length > 0 ? getValidImageUrl(product.imageUrls[0]) : "",
            size: selectedSize ?? undefined,
            color: selectedColor ?? undefined,
            stockQuantity: product.stockQuantity,
        });

        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2500);
    };

    const discountPercentage = product?.discountedPrice
        ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
        : 0;

    // Loading State
    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                <div className="flex flex-col md:flex-row gap-12 animate-pulse">
                    <div className="md:w-1/2">
                        <div className="aspect-[3/4] bg-gray-200 rounded-3xl"></div>
                        <div className="flex gap-3 mt-4">
                            {[1, 2, 3].map(i => <div key={i} className="w-20 h-24 bg-gray-200 rounded-xl"></div>)}
                        </div>
                    </div>
                    <div className="md:w-1/2 space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-full mt-6"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Error State
    if (error || !product) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <div className="w-24 h-24 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-text-dark mb-4">{error || "Ürün bulunamadı"}</h2>
                <Link href="/products">
                    <button className="text-primary hover:underline font-medium">← Koleksiyona Dön</button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
            {/* Breadcrumb */}
            <nav className="mb-8 text-sm text-text-muted flex items-center gap-2">
                <Link href="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
                <span>/</span>
                <Link href="/products" className="hover:text-primary transition-colors">Koleksiyon</Link>
                <span>/</span>
                <span className="text-text-dark font-medium truncate max-w-[200px]">{product.name}</span>
            </nav>

            <div className="flex flex-col md:flex-row gap-12">
                {/* Left — Image Gallery */}
                <div className="md:w-1/2">
                    {/* Main Image */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedImage}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="relative aspect-[3/4] bg-bg-gray rounded-3xl overflow-hidden shadow-lg"
                        >
                            {product.imageUrls?.length > 0 && !imgError[selectedImage] ? (
                                <Image
                                    src={getValidImageUrl(product.imageUrls[selectedImage])}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    priority
                                    onError={() => setImgError(prev => ({ ...prev, [selectedImage]: true }))}
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-text-muted text-lg">
                                    Görsel Yok
                                </div>
                            )}

                            {/* Discount Badge */}
                            {product.discountedPrice && (
                                <div className="absolute top-4 left-4 bg-accent text-white text-sm font-bold px-4 py-2 rounded-full shadow-md">
                                    %{discountPercentage} İndirim
                                </div>
                            )}

                            {/* Out of stock overlay */}
                            {!product.isInStock && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <span className="bg-white text-text-dark font-bold px-6 py-3 rounded-full text-lg shadow-xl">
                                        Tükendi
                                    </span>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Thumbnail Gallery */}
                    {product.imageUrls?.length > 1 && (
                        <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                            {product.imageUrls.map((url, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`relative w-20 h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-300 ${selectedImage === idx
                                        ? "border-primary shadow-md scale-105"
                                        : "border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100"
                                        }`}
                                >
                                    <Image
                                        src={getValidImageUrl(url)}
                                        alt={`${product.name} - ${idx + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="80px"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right — Product Info */}
                <div className="md:w-1/2">
                    {/* Category Badge */}
                    {product.categoryName && (
                        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
                            {product.categoryName}
                        </span>
                    )}

                    <h1 className="text-3xl md:text-4xl font-extrabold text-text-dark tracking-tight mb-4">
                        {product.name}
                    </h1>

                    {/* Price */}
                    <div className="flex items-baseline gap-3 mb-6">
                        {product.discountedPrice ? (
                            <>
                                <span className="text-3xl font-black text-primary">
                                    {formatPrice(product.discountedPrice)}
                                </span>
                                <span className="text-xl text-text-muted line-through">
                                    {formatPrice(product.price)}
                                </span>
                            </>
                        ) : (
                            <span className="text-3xl font-black text-text-dark">
                                {formatPrice(product.price)}
                            </span>
                        )}
                    </div>

                    {/* Stock Status */}
                    <div className="flex items-center gap-2 mb-8">
                        <div className={`w-2.5 h-2.5 rounded-full ${product.isInStock ? "bg-green-500" : "bg-red-500"}`}></div>
                        <span className={`text-sm font-medium ${product.isInStock ? "text-green-600" : "text-red-500"}`}>
                            {product.isInStock ? `Stokta Mevcut (${product.stockQuantity} adet)` : "Stokta Yok"}
                        </span>
                    </div>

                    {/* Description */}
                    {product.description && (
                        <div className="mb-8">
                            <p className="text-text-muted leading-relaxed">{product.description}</p>
                        </div>
                    )}

                    {/* Size Selector */}
                    {product.sizes && product.sizes.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-text-dark uppercase tracking-wider mb-3">Beden</h3>
                            <div className="flex flex-wrap gap-2">
                                {product.sizes.map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                                        className={`px-5 py-2.5 rounded-xl text-sm font-medium border-2 transition-all duration-200 ${selectedSize === size
                                            ? "border-primary bg-primary text-white shadow-md"
                                            : "border-gray-200 text-text-dark hover:border-primary/50 bg-white"
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Color Selector */}
                    {product.colors && product.colors.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-text-dark uppercase tracking-wider mb-3">Renk</h3>
                            <div className="flex flex-wrap gap-2">
                                {product.colors.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setSelectedColor(selectedColor === color ? null : color)}
                                        className={`px-5 py-2.5 rounded-xl text-sm font-medium border-2 transition-all duration-200 ${selectedColor === color
                                            ? "border-primary bg-primary text-white shadow-md"
                                            : "border-gray-200 text-text-dark hover:border-primary/50 bg-white"
                                            }`}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quantity + Add to Cart */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
                        {/* Quantity Selector */}
                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={quantity <= 1}
                                className="px-4 py-3 text-text-dark hover:bg-gray-200 transition-colors disabled:opacity-40"
                            >
                                −
                            </button>
                            <span className="w-14 text-center font-bold text-lg">{quantity}</span>
                            <button
                                onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                                disabled={quantity >= product.stockQuantity}
                                className="px-4 py-3 text-text-dark hover:bg-gray-200 transition-colors disabled:opacity-40"
                            >
                                +
                            </button>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={!product.isInStock || isAdded}
                            className={`relative flex-1 py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden shadow-2xl disabled:cursor-not-allowed ${isAdded
                                ? "bg-green-500 text-white shadow-green-500/30 scale-105"
                                : product.isInStock
                                    ? "bg-gradient-to-r from-primary to-primary-hover text-white shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 active:scale-95 group"
                                    : "bg-gray-300 text-gray-500 shadow-none"
                                }`}
                        >
                            {/* Glassmorphism Shine Effect */}
                            <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                            
                            {/* Glowing Orbs behind the button */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-accent to-primary rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
                            
                            <div className="relative z-10 flex items-center justify-center gap-3">
                              {isAdded ? (
                                  <>
                                      <svg className="w-6 h-6 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                      </svg>
                                      Sepete Eklendi!
                                  </>
                              ) : product.isInStock ? (
                                  <>
                                      <svg className="w-6 h-6 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                      </svg>
                                      Sepete Ekle — <span className="text-white/90">{formatPrice((product.discountedPrice ?? product.price) * quantity)}</span>
                                  </>
                              ) : (
                                  "Stokta Yok"
                              )}
                            </div>
                        </button>
                    </div>

                    {/* Product Meta Info */}
                    <div className="border-t border-gray-100 pt-6 space-y-3">
                        <div className="flex items-center gap-3 text-sm text-text-muted">
                            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>1500 TL ve üzeri <strong className="text-text-dark">ücretsiz kargo</strong></span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-text-muted">
                            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span>256-bit SSL ile <strong className="text-text-dark">güvenli ödeme</strong></span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-text-muted">
                            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>14 gün içinde <strong className="text-text-dark">kolay iade</strong></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
