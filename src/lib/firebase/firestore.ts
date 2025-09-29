// src/lib/firebase/firestore.ts

import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface ProductData {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export async function addProductToFirestore(data: ProductData) {
  try {
    const productsCollectionRef = collection(db, "products");

    await addDoc(productsCollectionRef, {
      ...data,
      price: Number(data.price),
      createdAt: serverTimestamp(),
      isAvailable: true,
    });

    return { success: true };
  } catch (error) {
    console.error("Error adding document: ", error);
    return { success: false, error: "Gagal menyimpan produk ke database." };
  }
}