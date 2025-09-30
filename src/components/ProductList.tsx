// src/components/ProductList.tsx

'use client'; 

import React, { useState, useEffect } from 'react';
import { getAvailableProducts } from "@/lib/firebase/data";
import ProductCard from "@/components/ProductCard";

// --- INTERFACE DIPERBAIKI ---
// Jika Anda menyimpan data ini di file umum, Anda bisa melakukan import di sini
interface ProductData {
    id: string; // Wajib dari doc.id
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    // Tambahkan properti lain yang ada di Firestore
}
// --------------------------

export default function ProductList() {
    // Menggunakan ProductData[]
    const [products, setProducts] = useState<ProductData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Perhatikan: Data yang dikembalikan harus ProductData[]
                const data: ProductData[] = await getAvailableProducts(); 
                setProducts(data);
            } catch (err) {
                console.error("Failed to load products:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    if (loading) {
        return <p className="text-center text-gray-500 text-lg">Memuat menu...</p>;
    }

    if (error || products.length === 0) {
        return (
            <p className="text-center text-gray-500 text-lg">
                Menu masih kosong, atau koneksi ke database gagal. Silakan tambahkan dari halaman admin.
            </p>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map(product => (
                // Garis merah hilang karena product adalah tipe ProductData
                <ProductCard key={product.id} product={product} /> 
            ))}
        </div>
    );
}