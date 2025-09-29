// src/app/api/midtrans-snap/route.ts

import { NextResponse } from 'next/server';
import { Snap } from 'midtrans-client';
import { ItemDetails } from 'midtrans-client/lib/snap'; // Import tipe data Midtrans

// 1. Definisikan tipe untuk data yang masuk (sesuai dari Checkout page)
interface MidtransRequest {
    orderId: string;
    grossAmount: number;
    items: ItemDetails[];
    customerDetails: {
        first_name: string;
        email: string;
        phone: string;
        last_name: string;
    };
}

// Inisialisasi Midtrans Snap Client
const snap = new Snap({
    isProduction: false, // Sandbox environment
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY, 
});

export async function POST(request: Request) {
    try {
        // Ambil data dari request body dan paksa tipenya
        const data: MidtransRequest = await request.json();
        
        const { orderId, grossAmount, items, customerDetails } = data;

        // Cek jika orderId/amount hilang
        if (!orderId || !grossAmount || grossAmount <= 0) {
            return NextResponse.json({ error: 'Data transaksi tidak lengkap atau jumlah tidak valid.' }, { status: 400 });
        }
        
        // 2. Format item_details agar sesuai tipe data Midtrans
        const formattedItems: ItemDetails[] = items.map(item => ({
            id: item.id,
            price: item.price,
            quantity: item.quantity,
            name: item.name
        }));


        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: grossAmount,
            },
            credit_card: { secure: true },
            item_details: formattedItems,
            customer_details: customerDetails,
            
            callbacks: {
                // Gunakan NEXT_PUBLIC_APP_URL yang Anda set di .env.local
                finish: `${process.env.NEXT_PUBLIC_APP_URL}/order-success`,
            }
        };

        const transaction = await snap.createTransaction(parameter);
        const snapToken = transaction.token;

        return NextResponse.json({ token: snapToken });
    } catch (error) {
        console.error('Midtrans API Error:', error);
        // Pastikan error log ini tertangkap saat Midtrans gagal
        return NextResponse.json({ error: 'Gagal membuat transaksi Midtrans. Periksa Server Key dan koneksi Anda.' }, { status: 500 });
    }
}