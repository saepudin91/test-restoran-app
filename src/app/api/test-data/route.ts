// src/app/api/test-data/route.ts

import { NextResponse } from 'next/server';
import { getAvailableProducts } from '@/lib/firebase/data'; // Import helper .js Anda

// Ini akan berjalan di Server Component runtime yang lebih stabil
export async function GET() {
    try {
        const products = await getAvailableProducts();

        // Cek apakah data valid sebelum mengirimnya
        if (!products || products.length === 0) {
            return NextResponse.json({ success: true, count: 0, message: "Koleksi kosong atau fetch gagal." }, { status: 200 });
        }

        return NextResponse.json({ success: true, count: products.length, data: products }, { status: 200 });

    } catch (error) {
        console.error("API TEST ERROR:", error);
        return NextResponse.json({ success: false, error: "Gagal menguji koneksi baca Firestore." }, { status: 500 });
    }
}