// src/lib/firebase/data.ts

import { db } from "./firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
}

export async function getAvailableProducts(): Promise<Product[]> {
    try {
        // Next.js Server Component akan menjalankan ini dengan efisien
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        const products: Product[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        } as Product));

        return products;
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
}