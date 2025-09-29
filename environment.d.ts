// environment.d.ts

// File ini HANYA untuk memberitahu TypeScript tentang tipe data dari environment variables Anda.
// JANGAN letakkan nilai atau secret key di sini.

namespace NodeJS {
    interface ProcessEnv {
        // 1. Konfigurasi Umum
        NEXT_PUBLIC_APP_URL: string;

        // 2. Firebase Configuration
        NEXT_PUBLIC_FIREBASE_API_KEY: string;
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: string;
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: string;
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
        NEXT_PUBLIC_FIREBASE_APP_ID: string;

        // 3. Google AI / Gemini Key
        GEMINI_API_KEY: string;

        // 4. Midtrans Sandbox Keys
        MIDTRANS_SERVER_KEY: string;
        NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: string;

        // Catatan: Jika Anda juga menggunakan MIDTRANS_CLIENT_KEY (tanpa NEXT_PUBLIC_) di server,
        // tambahkan juga di sini. Contoh:
        MIDTRANS_CLIENT_KEY: string;
    }
}