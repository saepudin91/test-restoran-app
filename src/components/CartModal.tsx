'use client';
import { useCart } from '@/context/CartContext';
import { Button } from './ui/button';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function CartModal() {
    // KOREKSI 1: Hapus 'items' dan 'formattedPrice' yang tidak digunakan dari destructuring.
    // Kita hanya butuh getTotalItems dan getTotalPrice.
    const { getTotalItems } = useCart();
    const totalItems = getTotalItems();

    // Catatan: Variabel totalPrice dan formattedPrice telah dihapus di sini
    // karena tidak ditampilkan di modal ini (hanya di halaman checkout).

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
