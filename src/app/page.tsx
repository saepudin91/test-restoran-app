// src/app/page.tsx

// PENTING: Halaman ini tetap Server Component. Kita akan import Client Component di bawah.
import CartModal from "@/components/CartModal";
import ProductList from "@/components/ProductList"; // Kita akan buat komponen ini
//import { addProductToFirestore } from '@/lib/firebase/firestore';

export default function LandingPage() {
  return (
    <>
      <div className="container mx-auto p-8">
        <header className="flex justify-between items-center mb-10 border-b pb-4">
          <h1 className="text-4xl font-extrabold text-gray-900">Menu Restoran Kami</h1>
          <CartModal />
        </header>

        {/* Panggil Client Component untuk fetching data */}
        <ProductList />
      </div>
    </>
  );
}