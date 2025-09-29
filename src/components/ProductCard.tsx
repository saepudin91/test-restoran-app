// src/components/ProductCard.tsx
'use client';

import Image from 'next/image';
import { Button } from './ui/button';
import { useCart } from '@/context/CartContext';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
}

export default function ProductCard({ product }: { product: Product }) {
    const { addToCart } = useCart();
    const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(product.price);

    const handleAddToCart = () => {
        addToCart(product);
    };

    return (
        <div className="border rounded-xl shadow-lg overflow-hidden bg-white">
            <div className="relative h-48 w-full">
                <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="100vw"
                />
            </div>
            <div className="p-4">
                <h3 className="text-xl font-bold text-gray-900 truncate">{product.name}</h3>
                <p className="text-sm text-gray-500 h-10 overflow-hidden mt-1">{product.description}</p>
                <p className="text-2xl font-extrabold text-blue-600 my-3">{formattedPrice}</p>
                <Button onClick={handleAddToCart} className="w-full bg-orange-500 hover:bg-orange-600">
                    Tambah ke Keranjang
                </Button>
            </div>
        </div>
    );
}