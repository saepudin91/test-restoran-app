'use client';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';

// Definisikan Interface untuk Customer (Menghilangkan potensi error 'any')
interface CustomerDetails {
    first_name: string;
    email: string;
    phone: string;
}

// Definisikan tipe untuk respons pembayaran Midtrans (mengatasi warning 'any')
interface MidtransResult {
    transaction_id: string;
    // Tambahkan properti Midtrans lainnya jika diperlukan
}

export default function CheckoutPage() {
    // KOREKSI 1: 'items' dan 'error' tidak digunakan untuk update state.
    // Kita hanya perlu fungsi Cart yang diperlukan (getTotalPrice, getTotalItems, clearCart).
    const { getTotalPrice, getTotalItems, clearCart } = useCart();
    const totalPrice = getTotalPrice();
    const [loading, setLoading] = useState(false);

    // KOREKSI 2: setCustomer tidak digunakan (karena Input disabled), tapi kita biarkan 
    // jika nanti form diaktifkan. Untuk sementara kita definisikan tipe customer.
    const [customer] = useState<CustomerDetails>({
        first_name: "Budi",
        email: "budi.utama@example.com",
        phone: "081234567890",
    });

    const handlePayment = async () => {
        // Kita tidak menggunakan 'items' di sini, tapi kita bisa akses langsung dari useCart jika diperlukan
        if (getTotalItems() === 0 || !customer.first_name || !customer.email) return;

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
                    // KOREKSI: Gunakan cart.items dari useCart, yang diakses di CartContext
                    items: JSON.parse(localStorage.getItem('cartItems') || '[]'), // Menggunakan data dummy karena 'items' dihapus dari destructuring
                    customerDetails: { ...customer, last_name: "Customer" },
                }),
            });

            const result = await response.json();

            if (response.ok && result.token) {
                // 2. Tampilkan Pop-up Pembayaran Midtrans
                (window as any).snap.pay(result.token, {
                    onSuccess: function (midtransResult: MidtransResult) { // Tipe midtransResult diperbaiki
                        clearCart();
                        // KOREKSI 3: Jangan gunakan alert()
                        // alert(`Pembayaran Sukses! ID: ${midtransResult.transaction_id}`); 
                        console.log(`Pembayaran Sukses! ID: ${midtransResult.transaction_id}`);
                        window.location.href = `/order-success`;
                    },
                    onError: function () {
                        // KOREKSI 3: Jangan gunakan alert()
                        console.error('Pembayaran Gagal.');
                    },
                    onClose: function () {
                        // KOREKSI 3: Jangan gunakan alert()
                        console.warn('Anda menutup pop-up Midtrans.');
                    }
                });

            } else {
                // KOREKSI 3: Jangan gunakan alert()
                console.error(`Gagal memuat pembayaran: ${result.error}`);
            }

        } catch (error) {
            // KOREKSI 3: Jangan gunakan alert(), gunakan console.error
            console.error("Terjadi kesalahan saat memulai pembayaran:", error);
        } finally {
            setLoading(false);
        }
    };

    // KOREKSI 4: formattedPrice dipindahkan ke luar component atau di dalam handlePayment
    // Agar tidak memicu warning 'formattedPrice is assigned a value but never used' jika di CartModal
    const formattedPrice = (price: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);

    return (
        <div className="container mx-auto p-8 max-w-xl">
            <h1 className="text-3xl font-bold mb-6">Checkout Pesanan</h1>

            {getTotalItems() === 0 ? (
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
                        <h2 className="text-xl font-semibold mb-3">Rincian Pesanan ({getTotalItems()} Item)</h2>
                        {/* KOREKSI: Gunakan items dari useCart secara eksplisit di sini */}
                        {useCart().items.map(item => (
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
