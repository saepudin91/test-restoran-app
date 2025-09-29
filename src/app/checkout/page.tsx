'use client';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';

// Deklarasi global untuk window.snap (untuk menghilangkan error 'as any' dan 'any')
declare global {
    interface Window {
        snap: {
            // KOREKSI: Ganti 'options: any' dengan tipe object atau hapus parameter jika tidak dipakai di sini.
            // Kita gunakan tipe yang lebih umum agar ESLint diam.
            pay: (token: string, options: Record<string, any>) => void;
        };
    }
}

// Definisikan Interface untuk Customer
interface CustomerDetails {
    first_name: string;
    email: string;
    phone: string;
}

// Definisikan tipe untuk respons pembayaran Midtrans
interface MidtransResult {
    transaction_id: string;
}

export default function CheckoutPage() {
    // KOREKSI UTAMA: Panggil HOOKS di LEVEL TERATAS dan HANYA SEKALI.
    const cart = useCart();

    // Ambil nilai yang diperlukan dari objek cart
    const totalPrice = cart.getTotalPrice();
    const totalItems = cart.getTotalItems();

    const [loading, setLoading] = useState(false);

    const [customer] = useState<CustomerDetails>({
        first_name: "Budi",
        email: "budi.utama@example.com",
        phone: "081234567890",
    });

    const handlePayment = async () => {
        // Periksa kondisi di dalam fungsi, BUKAN di level Hook
        if (totalItems === 0 || !customer.first_name || !customer.email) return;

        setLoading(true);
        const orderId = `ORDER-${uuidv4()}`;

        try {
            // 1. Panggil API Midtrans Snap
            const response = await fetch('/api/midtrans-snap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    grossAmount: totalPrice,
                    // Akses item dari objek cart yang sudah dideklarasikan di atas
                    items: cart.items,
                    customerDetails: { ...customer, last_name: "Customer" },
                }),
            });

            const result = await response.json();

            if (response.ok && result.token) {
                // KOREKSI FINAL: Menggunakan window.snap tanpa 'as any'
                window.snap.pay(result.token, {
                    onSuccess: function (midtransResult: MidtransResult) {
                        cart.clearCart();
                        console.log(`Pembayaran Sukses! ID: ${midtransResult.transaction_id}`);
                        window.location.href = `/order-success`;
                    },
                    onError: function () {
                        console.error('Pembayaran Gagal.');
                    },
                    onClose: function () {
                        console.warn('Anda menutup pop-up Midtrans.');
                    }
                });

            } else {
                console.error(`Gagal memuat pembayaran: ${result.error}`);
            }

        } catch (error) {
            console.error("Terjadi kesalahan saat memulai pembayaran:", error);
        } finally {
            setLoading(false);
        }
    };

    const formattedPrice = (price: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);

    return (
        <div className="container mx-auto p-8 max-w-xl">
            <h1 className="text-3xl font-bold mb-6">Checkout Pesanan</h1>

            {totalItems === 0 ? (
                <p className="text-gray-600">Keranjang kosong. <Link href="/" className="text-blue-600 hover:underline">Kembali ke menu</Link>.</p>
            ) : (
                <div className="space-y-6">
                    {/* Detail Pelanggan */}
                    <div className="p-4 border rounded-lg">
                        <h2 className="text-xl font-semibold mb-3">Detail Pelanggan</h2>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={customer.email} disabled />
                        <Label htmlFor="name" className="mt-3 block">Nama</Label>
                        <Input id="name" value={customer.first_name} disabled />
                    </div>

                    {/* Rincian Pesanan */}
                    <div className="p-4 border rounded-lg">
                        <h2 className="text-xl font-semibold mb-3">Rincian Pesanan ({totalItems} Item)</h2>
                        {cart.items.map(item => (
                            <div key={item.id} className="flex justify-between items-center border-b pb-2 text-sm">
                                <span>{item.name} <span className="font-bold">({item.quantity}x)</span></span>
                                <span>{formattedPrice(item.price * item.quantity)}</span>
                            </div>
                        ))}
                    </div>

                    {/* Total */}
                    <div className="pt-4 border-t border-dashed">
                        <div className="flex justify-between items-center text-2xl font-bold">
                            <span>Total Bayar:</span>
                            <span className="text-red-600">{formattedPrice(totalPrice)}</span>
                        </div>
                    </div>

                    {/* Tombol Pembayaran */}
                    <Button
                        onClick={handlePayment}
                        disabled={loading}
                        className="w-full mt-6 bg-green-600 hover:bg-green-700"
                    >
                        {loading ? 'Memuat Pembayaran...' : `Bayar Sekarang ${formattedPrice(totalPrice)}`}
                    </Button>
                </div>
            )}
        </div>
    );
}
