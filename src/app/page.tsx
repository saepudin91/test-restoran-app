// src/app/page.tsx

import { getAvailableProducts } from "@/lib/firebase/data";
import ProductCard from "@/components/ProductCard";
import CartModal from "@/components/CartModal";

export default async function LandingPage() {
  const products = await getAvailableProducts();

  return (
    <>
      <div className="container mx-auto p-8">
        <header className="flex justify-between items-center mb-10 border-b pb-4">
          <h1 className="text-4xl font-extrabold text-gray-900">Menu Restoran Kami</h1>
          <CartModal />
        </header>

        {products.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">Menu masih kosong. Silakan tambahkan dari halaman admin.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}