// src/app/checkout/page.tsx
'use client';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';

export default function CheckoutPage() {
    const { items, getTotalPrice, getTotalItems, clearCart } = useCart();
    const totalPrice = getTotalPrice();
    const [loading, setLoading] = useState(false);

    // State form pelanggan (MVP Sederhana)
    const [customer, setCustomer] = useState({
        first_name: "Budi",
        email: "budi.utama@example.com",
        phone: "081234567890",
    });

    const handlePayment = async () => {
        if (items.length === 0 || !customer.first_name || !customer.email) return;

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
                    items: items,
                    customerDetails: { ...customer, last_name: "Customer" },
                }),
            });

            const result = await response.json();

            if (response.ok && result.token) {
                // 2. Tampilkan Pop-up Pembayaran Midtrans
                (window as any).snap.pay(result.token, {
                    onSuccess: function (midtransResult: any) {
                        // Simulasikan pembersihan keranjang setelah sukses
                        clearCart();
                        alert(`Pembayaran Sukses! ID: ${midtransResult.transaction_id}`);
                        window.location.href = `/order-success`;
                    },
                    onError: function () { alert('Pembayaran Gagal.'); },
                    onClose: function () { alert('Anda menutup pop-up Midtrans.'); }
                });

            } else {
                alert(`Gagal memuat pembayaran: ${result.error}`);
            }

        } catch (error) {
            alert("Terjadi kesalahan saat memulai pembayaran.");
        } finally {
            setLoading(false);
        }
    };

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
                        {items.map(item => (
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