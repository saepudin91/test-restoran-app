// src/app/admin/add-product/page.tsx
'use client';

import { useState, useCallback } from 'react';
import { addProductToFirestore } from '@/lib/firebase/firestore';
//import { addProductToFirestore } from '@/lib/firebase/firestore';
// Import UI Components
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
// TIDAK ADA IMPORT UNTUK uploadProductImage

interface SaveResult {
    success: boolean;
    error?: string; // Tanda '?' berarti properti 'error' ini opsional
}

interface ProductData {
    name: string;
    description: string;
    price: number;
}

const initialProductData: ProductData = { name: '', description: '', price: 0 };

export default function AddProductPage() {
    // ... (states dan handleFileChange, handleDataChange tetap sama)

    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [productData, setProductData] = useState<ProductData>(initialProductData);
    const [imageUrl, setImageUrl] = useState('');
    const [status, setStatus] = useState('');
    const [isExtracted, setIsExtracted] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setIsExtracted(false);
            setProductData(initialProductData);
            setImageUrl('');
            setStatus('Foto siap diunggah.');
        }
    };

    const handleDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setProductData(prev => ({
            ...prev,
            [id]: id === 'price' ? parseFloat(value) || 0 : value,
        }));
    };

    const startExtraction = useCallback(async () => {
        if (!file) { setStatus('Pilih foto terlebih dahulu.'); return; }

        setLoading(true);
        setStatus('1. Mengunggah foto ke Cloudinary via API...');

        try {
            // --- PERUBAHAN KRUSIAL: MENGIRIM FILE MENTAH MELALUI FormData ---
            const formData = new FormData();
            // Mengirim objek File yang diambil dari state
            formData.append('file', file);

            // FETCH PERTAMA: UPLOAD ke CLOUDINARY API Route
            const uploadResponse = await fetch('/api/cloudinary-upload', {
                method: 'POST',
                // PENTING: Browser menangani Content-Type untuk FormData
                body: formData,
            });

            const uploadResult = await uploadResponse.json();

            if (!uploadResponse.ok || !uploadResult.success) {
                setStatus(`ERROR: Gagal upload. ${uploadResult.error || 'Cek log server.'}`);
                setLoading(false);
                return;
            }

            const publicUrl = uploadResult.imageUrl;
            setImageUrl(publicUrl);
            setStatus('2. Foto berhasil diunggah. Memanggil AI untuk ekstraksi...');

            // FETCH KEDUA: EKSTRAKSI AI
            const response = await fetch('/api/extract-product', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl: publicUrl }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setProductData(result.data);
                setIsExtracted(true);
                setStatus('3. Ekstraksi AI Berhasil! Data siap disimpan. Koreksi jika perlu.');
            } else {
                setStatus(`ERROR: Ekstraksi gagal. ${result.error || 'Silakan coba lagi.'}`);
                setProductData(initialProductData);
            }

        } catch (err) {
            console.error(err);
            setStatus('ERROR: Terjadi kegagalan saat proses upload atau ekstraksi.');
        } finally {
            setLoading(false);
        }
    }, [file]);

    // ... (handleSaveProduct dan JSX return tetap sama)
    const handleSaveProduct = async () => {
        if (!productData.name || !productData.price || !imageUrl) {
            setStatus('Nama produk dan harga harus diisi sebelum disimpan.');
            return;
        }

        setLoading(true);
        setStatus('4. Menyimpan data produk ke Firestore...');

        const result = await addProductToFirestore({ ...productData, imageUrl });

        if (result.success) {
            setStatus('✅ Produk berhasil disimpan dan tampil di menu!');
            setProductData(initialProductData);
            setImageUrl('');
            setFile(null);
            setIsExtracted(false);
        } else {
            setStatus(`❌ Gagal menyimpan"}`);
        }

        setLoading(false);
    };

    return (
        <div className="container max-w-4xl mx-auto p-8">
            <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-800">Admin: Tambah Menu Restoran</h1>

            <div className="space-y-6 p-6 border rounded-xl bg-white shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-700">1. Unggah & Ekstrak Data Otomatis</h2>

                <Label htmlFor="picture" className="text-base font-medium">Pilih Foto Makanan</Label>
                <Input id="picture" type="file" onChange={handleFileChange} accept="image/*" disabled={loading} />

                <Button
                    onClick={startExtraction}
                    disabled={!file || loading || isExtracted}
                    className="w-full bg-blue-600 hover:bg-blue-700 transition duration-200"
                >
                    {loading ? 'Memproses Ekstraksi...' : isExtracted ? 'Ekstraksi Selesai' : 'Ekstrak Data Produk dengan AI'}
                </Button>
                <p className={`text-sm mt-2 font-medium ${status.includes('ERROR') ? 'text-red-600' : 'text-blue-600'}`}>{status}</p>
            </div>

            {(isExtracted || productData.name) && (
                <div className="mt-10 space-y-6 p-6 border-2 border-green-500 rounded-xl bg-green-50 shadow-xl">
                    <h2 className="text-2xl font-semibold text-green-700">2. Koreksi Hasil AI & Simpan</h2>
                    <div className='grid gap-4 md:grid-cols-2'>
                        <div>
                            <Label htmlFor="name">Nama Produk</Label>
                            <Input id="name" value={productData.name} onChange={handleDataChange} disabled={loading} />
                        </div>
                        <div>
                            <Label htmlFor="price">Harga (Rupiah)</Label>
                            <Input id="price" type="number" value={productData.price === 0 ? '' : productData.price} onChange={handleDataChange} disabled={loading} placeholder="0" />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="description">Deskripsi Singkat</Label>
                        <Textarea id="description" value={productData.description} onChange={handleDataChange} disabled={loading} rows={3} />
                    </div>

                    <Button
                        onClick={handleSaveProduct}
                        disabled={loading || !productData.name || productData.price <= 0}
                        className="mt-4 w-full bg-green-600 hover:bg-green-700 transition duration-200"
                    >
                        {loading ? 'Menyimpan...' : 'Simpan Produk dan Tampilkan di Menu'}
                    </Button>
                </div>
            )}
        </div>
    );
}