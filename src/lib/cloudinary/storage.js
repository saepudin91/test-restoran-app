// Contoh Logika Upload ke Cloudinary (Server-Side Helper)
'use server';

import { v2 as cloudinary } from 'cloudinary';
import { Buffer } from 'buffer'; // Diperlukan untuk menangani file buffer

// Konfigurasi Cloudinary (Ambil dari Dashboard Anda)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // <--- Ganti dengan ENV Anda
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export async function uploadProductImage(file) {
    // Ubah File (Blob) menjadi Buffer (Diperlukan untuk Cloudinary/Node.js)
    const buffer = Buffer.from(await file.arrayBuffer());

    return new Promise((resolve, reject) => {
        // Panggil fungsi upload Cloudinary
        cloudinary.uploader.upload_stream({ resource_type: "image" }, (error, result) => {
            if (error) {
                console.error("Cloudinary Upload Error:", error);
                return reject(error);
            }
            // Mengembalikan URL publik yang akan dikirim ke API Gemini
            resolve(result.secure_url);
        }).end(buffer);
    });
}