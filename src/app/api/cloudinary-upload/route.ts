// src/app/api/cloudinary-upload/route.ts

import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { Buffer } from 'buffer';

// Interface untuk tipe data yang dikembalikan Cloudinary yang kita butuhkan
interface CloudinaryResult {
    secure_url: string;
}

// Konfigurasi Cloudinary dari Environment Variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

// CORS Handling untuk Preflight (Wajib untuk Next.js)
export async function OPTIONS() {
    return NextResponse.json(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ success: false, error: 'File tidak ditemukan.' }, { status: 400 });
        }

        // Mengubah File mentah menjadi Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload ke Cloudinary menggunakan Promise
        // Terapkan tipe CloudinaryResult ke Promise
        const result = await new Promise<CloudinaryResult>((resolve, reject) => {
            cloudinary.uploader.upload_stream({
                resource_type: "auto",
                folder: "restoran-mvp-products"
            }, (error, result) => {
                if (error) return reject(error);
                // Type assertion di sini untuk menjamin result memiliki secure_url
                resolve(result as CloudinaryResult);
            }).end(buffer);
        });

        // Kembalikan URL publik
        return NextResponse.json({
            success: true,
            // Mengakses properti tanpa menggunakan 'as any'
            imageUrl: result.secure_url
        });

    } catch (error) {
        console.error("Cloudinary Upload API Error:", error);
        return NextResponse.json({
            success: false,
            error: "Gagal mengunggah file ke Cloudinary."
        }, { status: 500 });
    }
}