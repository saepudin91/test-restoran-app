// lib/firebase/firestore.js (Jika Anda menggunakan file .js)

import { db } from './firebase'; // Pastikan path ini benar!
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function addProductToFirestore(productData) {
  try {
    const productsCollectionRef = collection(db, 'products');

    // Simpan data produk baru
    await addDoc(productsCollectionRef, {
      ...productData,
      createdAt: serverTimestamp(),
      // Pastikan tidak ada field undefined atau objek non-serializable di productData
    });

    return { success: true };
  } catch (error) {
    // Ini adalah kunci untuk debugging
    console.error("🔥 FIREBASE SAVE ERROR:", error);
    // Mengembalikan Error yang jelas ke frontend
    throw new Error(`Gagal menyimpan produk: ${error.message || 'Unknown Firestore error'}`);
  }
}