"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

interface ProductCardProps {
    id: number;
    name: string;
    price: number;
    discountedPrice?: number | null;
    imageUrl: string;
}

export default function ProductCard({ id, name, price, discountedPrice, imageUrl }: ProductCardProps) {
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

    const validImageUrl = getValidImageUrl(imageUrl);
    const [imgError, setImgError] = React.useState(false);

    const { addToCart } = useCart();
    const [isAdded, setIsAdded] = React.useState(false);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        addToCart({
            id,
            name,
            price: discountedPrice ?? price,
            quantity: 1,
            imageUrl: validImageUrl
        });

        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    return (
        <Link href={`/products/${id}`} className="block h-full">
            <div className="group relative bg-white border border-gray-100 rounded-2xl p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden flex flex-col h-full cursor-pointer">
                {/* Image Container */}
                <div className="relative w-full aspect-[4/5] bg-bg-gray rounded-xl overflow-hidden mb-4">
                    {validImageUrl && !imgError ? (
                        <Image
                            src={validImageUrl}
                            alt={name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-text-muted">
                            Görsel Yok
                        </div>
                    )}

                    {/* Discount Badge */}
                    {discountedPrice && (
                        <div className="absolute top-2 left-2 bg-accent text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                            %{Math.round(((price - discountedPrice) / price) * 100)} İndirim
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex flex-col flex-grow">
                    <h3 className="text-lg font-semibold text-text-dark mb-1 line-clamp-1">{name}</h3>

                    <div className="mt-auto flex items-end justify-between">
                        <div className="flex flex-col">
                            {discountedPrice ? (
                                <>
                                    <span className="text-sm text-text-muted line-through">{formatPrice(price)}</span>
                                    <span className="text-lg font-bold text-text-dark">{formatPrice(discountedPrice)}</span>
                                </>
                            ) : (
                                <span className="text-lg font-bold text-text-dark">{formatPrice(price)}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Add to Cart Button (Hover Reveal) */}
                <button
                    onClick={handleAddToCart}
                    disabled={isAdded}
                    className={`mt-4 w-full py-2.5 rounded-xl font-medium transition-all duration-300 transform 
                    ${isAdded
                            ? 'bg-green-500 text-white translate-y-0 opacity-100'
                            : 'bg-primary hover:bg-primary-hover text-white opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
                        }`}
                >
                    {isAdded ? 'Sepete Eklendi ✔️' : 'Sepete Ekle'}
                </button>
            </div>
        </Link>
    );
}
