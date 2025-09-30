// src/app/api/extract-product/route.ts

import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

interface ExtractedProduct {
    name: string;
    description: string;
    price: number;
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Helper: Mengubah URL gambar menjadi format Base64
async function urlToBase64(url: string) {
    console.log(`[DEBUG] Mencoba fetch URL: ${url}`);
    try {
        const fetchResponse = await fetch(url);
        console.log(`[DEBUG] Fetch berhasil. Status: ${fetchResponse.status}`);
        if (!fetchResponse.ok) {
            console.error(`[ERROR] Gagal Fetch, Status: ${fetchResponse.status}, Text: ${fetchResponse.statusText}`);
            throw new Error(`Gagal mengambil gambar dari URL: ${fetchResponse.statusText}. Status HTTP: ${fetchResponse.status}`);
        }
        const buffer = await fetchResponse.arrayBuffer();
        return Buffer.from(buffer).toString("base64");
    } catch (error) {
        console.error("[CRITICAL ERROR] Kesalahan Jaringan/Fetch:", error instanceof Error ? error.message : "Kesalahan tidak dikenal.");
        throw new Error("Gagal melakukan fetch URL gambar: Periksa URL atau masalah jaringan server.");
    }
}

// --- CORS HANDLING WAJIB ---
export async function OPTIONS() {
    const response = new NextResponse(null, { status: 204 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return response;
}
// --- END CORS HANDLING ---

export async function POST(request: Request) {
    try {
        const { imageUrl } = await request.json();

        if (!imageUrl) {
            const response = NextResponse.json({ success: false, error: "URL gambar tidak ditemukan." }, { status: 400 });
            response.headers.set('Access-Control-Allow-Origin', '*');
            return response;
        }

        const base64Image = await urlToBase64(imageUrl);

        // 1. Permintaan ke Gemini Vision
        const geminiResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            // ... (sisa konfigurasi Gemini)
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

        const extractedData = JSON.parse(geminiResponse.text!) as ExtractedProduct;

        const response = NextResponse.json({ success: true, data: extractedData });
        response.headers.set('Access-Control-Allow-Origin', '*');

        return response;

    } catch (error) {
        console.error("AI Extraction Orchestration Failed:", error);
        const errorMessage = error instanceof Error ? error.message : "Kegagalan pada proses orkestrasi AI.";

        const response = NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
        response.headers.set('Access-Control-Allow-Origin', '*');

        return response;
    }
}