"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import { motion, Variants } from "framer-motion";

interface Product {
  id: number;
  name: string;
  price: number;
  discountedPrice: number | null;
  imageUrls: string[];
  categoryId: number;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<"kadin" | "erkek">("kadin");
  const [loading, setLoading] = useState(true);

  // Animation Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  useEffect(() => {
    // Fetch seed products
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Products`);
        if (response.ok) {
          const result = await response.json();
          // Handle paginated response (data can be an array or an object with items)
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

  // Filter products based on selected category (Assuming 1=Kadin, 2=Erkek based on seed order)
  const filteredProducts = products.filter(p => activeCategory === "kadin" ? p.categoryId === 1 : p.categoryId === 2);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center bg-gray-50 overflow-hidden transition-colors duration-700">
        {/* Category Toggle Switch */}
        <div className="absolute top-24 z-20 flex bg-white rounded-full p-1 shadow-md border border-gray-100">
          <button
            onClick={() => setActiveCategory("kadin")}
            className={`px-8 py-2.5 rounded-full font-medium transition-all duration-300 ${activeCategory === "kadin" ? "bg-text-dark text-white shadow-md" : "text-text-muted hover:text-text-dark"}`}
          >
            Kadın
          </button>
          <button
            onClick={() => setActiveCategory("erkek")}
            className={`px-8 py-2.5 rounded-full font-medium transition-all duration-300 ${activeCategory === "erkek" ? "bg-text-dark text-white shadow-md" : "text-text-muted hover:text-text-dark"}`}
          >
            Erkek
          </button>
        </div>

        {/* Dynamic Background Blobs */}
        <div className={`absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl mix-blend-multiply opacity-50 animate-blob transition-colors duration-1000 ${activeCategory === "kadin" ? "bg-primary/20" : "bg-blue-400/20"}`}></div>
        <div className={`absolute top-40 right-10 w-96 h-96 rounded-full blur-3xl mix-blend-multiply opacity-50 animate-blob animation-delay-2000 transition-colors duration-1000 ${activeCategory === "kadin" ? "bg-accent/20" : "bg-slate-500/20"}`}></div>

        <motion.div
          key={activeCategory} // Force re-animate on category change
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 text-center px-4 max-w-3xl mt-12"
        >
          <span className={`font-semibold tracking-wider uppercase text-sm mb-4 block transition-colors duration-500 ${activeCategory === "kadin" ? "text-accent" : "text-blue-600"}`}>
            {activeCategory === "kadin" ? "Zarif & Güçlü" : "Modern & Klasik"}
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-text-dark tracking-tight leading-tight mb-6">
            {activeCategory === "kadin" ? (
              <>Şıklık <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Sadelikte</span> Gizlidir.</>
            ) : (
              <>Stil <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-600 to-blue-600">Detaylarda</span> Saklıdır.</>
            )}
          </h1>
          <p className="text-xl text-text-muted mb-10 max-w-xl mx-auto">
            {activeCategory === "kadin"
              ? "Özenle seçilmiş minimalist kadın parçalarıyla tarzınızı yeniden tanımlayın."
              : "Her anınıza uyum sağlayacak güçlü ve özgüvenli erkek koleksiyonunu keşfedin."}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={`/products?category=${activeCategory}`} className="w-full sm:w-auto">
              <button className="w-full px-8 py-4 bg-text-dark hover:bg-black text-white rounded-full font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                Koleksiyonu Keşfet
              </button>
            </Link>
            <Link href="/about" className="w-full sm:w-auto">
              <button className="w-full px-8 py-4 bg-white text-text-dark border-2 border-gray-100 hover:border-gray-200 rounded-full font-medium transition-all">
                Hakkımızda
              </button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Featured Products Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-text-dark">Öne Çıkanlar</h2>
            <p className="text-text-muted mt-2">En çok tercih edilen {activeCategory === "kadin" ? "kadın" : "erkek"} parçalarımız.</p>
          </div>
          <Link href={`/products?category=${activeCategory}`}>
            <button className={`hidden sm:block font-medium hover:underline ${activeCategory === "kadin" ? "text-primary" : "text-blue-600"}`}>
              Tümünü Gör &rarr;
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-white border border-gray-100 rounded-2xl p-4 h-96 flex flex-col">
                <div className="w-full h-2/3 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mt-auto"></div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            key={activeCategory} // Force re-render list on category toggle
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {filteredProducts.slice(0, 4).map((product) => (
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
              <div className="col-span-1 sm:col-span-2 lg:col-span-4 text-center py-12 text-gray-500">
                Bu kategori için henüz ürün bulunmuyor.
              </div>
            )}
          </motion.div>
        )}
      </section>
    </div>
  );
}
