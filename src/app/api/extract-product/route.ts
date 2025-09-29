// src/app/api/extract-product/route.ts

import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

// Interface untuk data yang diekstrak AI (agar TypeScript mengenali strukturnya)
interface ExtractedProduct {
    name: string;
    description: string;
    price: number;
}

// ----------------------------------------------------
// INISIALISASI AI (Menggunakan sintaks yang stabil untuk Vercel)
// ----------------------------------------------------

// Menggunakan tanda seru (!) untuk meyakinkan TypeScript bahwa nilai pasti ada di Vercel
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });


// Helper: Mengubah URL gambar menjadi format Base64
async function urlToBase64(url: string) {
    const fetchResponse = await fetch(url);
    if (!fetchResponse.ok) {
        throw new Error(`Gagal mengambil gambar dari URL: ${fetchResponse.statusText}`);
    }
    const buffer = await fetchResponse.arrayBuffer();
    return Buffer.from(buffer).toString("base64");
}

export async function POST(request: Request) {
    try {
        const { imageUrl } = await request.json();

        if (!imageUrl) {
            return NextResponse.json({ success: false, error: "URL gambar tidak ditemukan." }, { status: 400 });
        }

        const base64Image = await urlToBase64(imageUrl);

        // 1. Permintaan ke Gemini Vision
        const geminiResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{
                role: 'user',
                parts: [
                    { text: `Ekstrak Nama, Deskripsi (max 30 kata), dan Perkiraan Harga (hanya angka) dari gambar makanan ini. Berikan hasilnya dalam format JSON berikut: {name: string, description: string, price: number}. Jika harga tidak terlihat, berikan nilai 0.` },
                    { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
                ]
            }],
            config: {
                responseMimeType: "application/json",
            },
        });

        // 2. Parsing dan Type Assertion (Memaksa Tipe Data untuk Hilangkan Garis Merah)
        // Kita menggunakan tanda seru '!' pada .text untuk meyakinkan TSC.
        const extractedData = JSON.parse(geminiResponse.text!) as ExtractedProduct;

        return NextResponse.json({ success: true, data: extractedData });

    } catch (error) {
        console.error("AI Extraction Orchestration Failed:", error);
        return NextResponse.json({ success: false, error: "Kegagalan pada proses orkestrasi AI." }, { status: 500 });
    }
}