'use client';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';

// Definisikan Tipe data yang dibutuhkan oleh Midtrans Callback
interface MidtransCallbackResult {
    transaction_id: string;
    status_code?: string;
    status_message?: string;
    // Tambahkan properti lain yang mungkin dikembalikan Midtrans saat error
    // Agar tipe data di callback error juga aman dari ESLint
    finish_redirect_url?: string;
}

// Definisikan SnapOptions dengan tipe data yang ketat
interface SnapOptions {
    onSuccess: (result: MidtransCallbackResult) => void;
    // KOREKSI: Menggunakan tipe data ketat MidtransCallbackResult untuk error/close
    onError: (result: MidtransCallbackResult) => void;
    onClose: () => void;
}

// Deklarasi global untuk window.snap
declare global {
    interface Window {
        snap: {
            pay: (token: string, options: SnapOptions) => void;
        };
    }
}

// Definisikan Interface untuk Customer
interface CustomerDetails {
    first_name: string;
    email: string;
    phone: string;
}

export default function CheckoutPage() {
    // KOREKSI UTAMA: Panggil HOOKS di LEVEL TERATAS dan HANYA SEKALI.
    const cart = useCart();

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
                    items: cart.items,
                    customerDetails: { ...customer, last_name: "Customer" },
                }),
            });

            const result = await response.json();

            if (response.ok && result.token) {
                // KOREKSI FINAL: Menggunakan window.snap dengan tipe data ketat
                window.snap.pay(result.token, {
                    onSuccess: function (midtransResult) {
                        cart.clearCart();
                        console.log(`Pembayaran Sukses! ID: ${midtransResult.transaction_id}`);
                        window.location.href = `/order-success`;
                    },
                    // Menggunakan tipe yang ketat (MidtransCallbackResult)
                    onError: function (midtransResult) {
                        console.error('Pembayaran Gagal.', midtransResult.status_code, midtransResult.status_message);
                        // Jika error, redirect ke halaman error
                        window.location.href = `/order-error`;
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
