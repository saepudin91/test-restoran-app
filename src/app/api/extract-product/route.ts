// src/app/api/extract-product/route.ts

//import { GoogleGenAI } from "@google/genai";
import { NextResponse } from 'next/server';


const aiModule = require('@google/genai');
const GoogleGenAI = aiModule.GoogleGenAI || aiModule.default.GoogleGenAI;
//const { GoogleGenAI } = aiModule;
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Helper: Mengubah URL gambar menjadi format Base64 untuk Gemini Vision
async function urlToBase64(url: string) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Gagal mengambil gambar dari URL: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString("base64");
}

export async function POST(request: Request) {
    try {
        const { imageUrl } = await request.json();
        if (!imageUrl) {
            return NextResponse.json({ success: false, error: "URL gambar tidak ditemukan." }, { status: 400 });
        }

        const base64Image = await urlToBase64(imageUrl);

        // Permintaan ke Gemini Vision dengan format JSON wajib
        const response = await ai.models.generateContent({
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

        const extractedData = JSON.parse(response.text);

        return NextResponse.json({ success: true, data: extractedData });

    } catch (error) {
        console.error("AI Extraction Orchestration Failed:", error);
        return NextResponse.json({ success: false, error: "Kegagalan pada proses orkestrasi AI." }, { status: 500 });
    }
}