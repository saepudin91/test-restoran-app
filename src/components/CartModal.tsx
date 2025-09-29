// src/components/CartModal.tsx
'use client';
import { useCart } from '@/context/CartContext';
import { Button } from './ui/button';
import { ShoppingCart } from 'lucide-react'; // Asumsi Anda install lucide-react
import Link from 'next/link';

export default function CartModal() {
    const { items, getTotalItems, getTotalPrice } = useCart();
    const totalItems = getTotalItems();
    const totalPrice = getTotalPrice();

    const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalPrice);

    return (
        <div className="relative">
            <Link href="/checkout" passHref>
                <Button variant="outline" className="relative">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Keranjang
                    {totalItems > 0 && (
                        <span className="absolute top-[-5px] right-[-5px] bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {totalItems}
                        </span>
                    )}
                </Button>
            </Link>

            {/* Modal atau Sidebar Cart bisa diimplementasikan di sini */}
            {/* Untuk MVP, kita langsung arahkan ke halaman checkout */}
        </div>
    );
}