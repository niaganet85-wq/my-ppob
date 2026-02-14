const axios = require('axios');
const crypto = require('crypto');

export default async function handler(req, res) {
    // Memastikan hanya permintaan POST yang diproses
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Metode Tidak Diizinkan' });
    }

    const { sku, target } = req.body;

    // Kredensial Anda yang diambil dari Environment Variables Vercel
    const DIGI_USER = process.env.DIGI_USER; // cabivaoJKz6D
    const DIGI_KEY = process.env.DIGI_KEY;   // 36b29847-b56d-5dff-b8e7-a3e055860dbf

    // Membuat nomor referensi unik untuk setiap transaksi
    const refId = 'NIAGA-' + Date.now();

    // Membuat MD5 Signature sesuai aturan Digiflazz (user + key + ref_id)
    const sign = crypto.createHash('md5')
        .update(DIGI_USER + DIGI_KEY + refId)
        .digest('hex');

    try {
        // Mengirimkan perintah transaksi ke server Digiflazz
        const response = await axios.post('https://api.digiflazz.com/v1/transaction', {
            username: DIGI_USER,
            buyer_sku_code: sku,
            customer_no: target,
            ref_id: refId,
            sign: sign
        });

        // Mengirimkan hasil sukses kembali ke website Anda
        return res.status(200).json(response.data);
    } catch (error) {
        // Mengirimkan pesan jika terjadi gangguan koneksi atau saldo habis
        return res.status(500).json({ 
            message: 'Gagal memproses transaksi ke Digiflazz',
            error: error.message 
        });
    }
}
