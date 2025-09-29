// src/app/order-success/page.tsx
'use client';

import Link from 'next/link';
import { CheckCircle } from 'lucide-react'; // Asumsi Anda menggunakan lucide-react
import { Button } from '@/components/ui/button';

export default function OrderSuccessPage() {

    // Catatan: Jika Anda ingin mengambil ID pesanan dari URL, Anda bisa menggunakan useSearchParams dari next/navigation
    // const searchParams = useSearchParams();
    // const orderId = searchParams.get('orderId'); 

    return (
        <div className="container mx-auto p-8 max-w-lg text-center h-screen flex flex-col justify-center items-center">

            <CheckCircle className="w-24 h-24 text-green-500 mb-6" />

            <h1 className="text-4xl font-extrabold text-gray-800 mb-4">Pembayaran Berhasil!</h1>

            <p className="text-lg text-gray-600 mb-8">
                Terima kasih atas pesanan Anda. Kami sedang memproses pesanan dan akan segera mengirimkannya.
            </p>

            {/* Jika Anda mendapatkan ID pesanan dari URL, Anda bisa menampilkannya di sini */}
            {/* {orderId && (
        <p className="text-md font-semibold text-gray-700 mb-4">
          Nomor Pesanan Anda: #{orderId}
        </p>
      )} */}

            <div className='space-y-4'>
                <Link href="/">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        Kembali ke Menu Utama
                    </Button>
                </Link>
                <Link href="/admin/add-product">
                    <Button variant="ghost" className="w-full text-sm">
                        (Akses Admin Panel)
                    </Button>
                </Link>
            </div>

        </div>
    );
}