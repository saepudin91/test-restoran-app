// src/app/api/midtrans-snap/route.ts

import { NextResponse } from 'next/server';
// DIUBAH: Import default dari 'midtrans-client'
import midtransClient from 'midtrans-client';

// DIHAPUS: Import yang menyebabkan error TypeScript
// import { ItemDetails } from 'midtrans-client/lib/snap'; 

// DITAMBAHKAN: Definisikan tipe ItemDetails secara manual di sini.
// Ini adalah cara yang lebih aman dan bersih.
interface ItemDetails {
    id: string;
    price: number;
    quantity: number;
    name: string;
}

// Definisikan tipe untuk data yang masuk dari request body
interface MidtransRequest {
    orderId: string;
    grossAmount: number;
    items: ItemDetails[];
    customerDetails: {
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
    };
}

// DIUBAH: Inisialisasi Midtrans Snap Client sesuai dengan cara import yang benar
const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

export async function POST(request: Request) {
    try {
        const data: MidtransRequest = await request.json();
        const { orderId, grossAmount, items, customerDetails } = data;

        if (!orderId || !grossAmount || grossAmount <= 0) {
            return NextResponse.json({ error: 'Data transaksi tidak lengkap atau jumlah tidak valid.' }, { status: 400 });
        }

        // Tidak ada yang perlu diubah di sini, karena tipe ItemDetails sudah kita definisikan di atas
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
                finish: `${process.env.NEXT_PUBLIC_APP_URL}/order-success`,
            }
        };

        const transaction = await snap.createTransaction(parameter);
        const snapToken = transaction.token;

        return NextResponse.json({ token: snapToken });
    } catch (error) {
        console.error('Midtrans API Error:', error);
        return NextResponse.json({ error: 'Gagal membuat transaksi Midtrans.' }, { status: 500 });
    }
}
