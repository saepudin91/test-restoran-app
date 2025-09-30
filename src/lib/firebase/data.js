// src/lib/firebase/data.js (Kode yang perlu Anda periksa)

import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function getAvailableProducts() {
    try {
        // PERIKSA INI: Pastikan nama koleksi 'products' SAMA PERSIS dengan yang di Console.
        const productsCollectionRef = collection(db, 'products');

        const snapshot = await getDocs(productsCollectionRef);

        // LOGIKA MAPPING DATA: Ini harus mengonversi format Firestore ke array JSON.
        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(), // Mengambil semua field data (name, price, imageUrl, dll.)
        }));

        // Log ini akan muncul di terminal jika berhasil
        console.log(`DEBUG: Data produk berhasil dimuat. Jumlah: ${products.length}`);
        return products;
    } catch (error) {
        // Log ini akan muncul di terminal jika gagal
        console.error("FIREBASE FETCH ERROR di getAvailableProducts:", error);

        // Melemparkan error agar Client Component menampilkan pesan gagal
        throw new Error("Gagal mengambil data produk karena masalah koneksi/query.");
    }
}