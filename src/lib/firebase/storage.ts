// src/lib/firebase/storage.ts

import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL, StorageReference } from "firebase/storage";

export async function uploadProductImage(file: File): Promise<string> {
    const storageRef: StorageReference = ref(
        storage,
        `products/${Date.now()}_${file.name}`
    );

    try {
        const snapshot = await uploadBytes(storageRef, file);
        const imageUrl: string = await getDownloadURL(snapshot.ref);
        return imageUrl;

    } catch (error) {
        console.error("FIREBASE STORAGE ERROR:", error);
        throw new Error("Gagal mengunggah foto produk ke Firebase Storage.");
    }
}