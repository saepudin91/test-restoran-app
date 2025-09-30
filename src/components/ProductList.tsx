// src/components/ProductList.tsx

'use client'; // WAJIB: Agar hooks React dapat digunakan

import React, { useState, useEffect } from 'react';
import { getAvailableProducts } from "@/lib/firebase/data";
import ProductCard from "@/components/ProductCard";

export default function ProductList() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getAvailableProducts();
                setProducts(data);
            } catch (err) {
                // Tangkap error koneksi yang bandel di sisi client
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
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}