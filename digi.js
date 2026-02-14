const axios = require('axios');
const crypto = require('crypto');

export default async function handler(req, res) {
    // Hanya izinkan metode POST
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { action, sku, target } = req.body;
    
    // Mengambil Kredensial dari Vercel Environment Variables
    const DIGI_USER = process.env.DIGI_USER; 
    const DIGI_KEY = process.env.DIGI_KEY;

    try {
        // --- LOGIKA 1: CEK SALDO (Khusus Admin) ---
        if (action === 'cek_saldo') {
            const sign = crypto.createHash('md5')
                .update(DIGI_USER + DIGI_KEY + 'depo')
                .digest('hex');

            const response = await axios.post('https://api.digiflazz.com/v1/cek-saldo', {
                cmd: 'depo',
                username: DIGI_USER,
                sign: sign
            });

            return res.status(200).json(response.data);
        }

        // --- LOGIKA 2: RIWAYAT TRANSAKSI (Khusus Admin) ---
        if (action === 'riwayat') {
            // Mengambil history transaksi pascabayar/prabayar
            const sign = crypto.createHash('md5')
                .update(DIGI_USER + DIGI_KEY + 'history')
                .digest('hex');
            
            const response = await axios.post('https://api.digiflazz.com/v1/transaction-history', {
                username: DIGI_USER,
                sign: sign,
                cmd: 'history'
            });
            
            return res.status(200).json(response.data);
        }

        // --- LOGIKA 3: TRANSAKSI MEMBER (Beli Game) ---
        // Wajib ada SKU (Kode Produk) dan Target (ID Pelanggan)
        if (!sku || !target) {
            return res.status(400).json({ message: 'Data pesanan tidak lengkap' });
        }

        const refId = 'NIAGA-' + Date.now();
        const sign = crypto.createHash('md5')
            .update(DIGI_USER + DIGI_KEY + refId)
            .digest('hex');

        const response = await axios.post('https://api.digiflazz.com/v1/transaction', {
            username: DIGI_USER,
            buyer_sku_code: sku,
            customer_no: target,
            ref_id: refId,
            sign: sign
        });

        return res.status(200).json(response.data);

    } catch (error) {
        // Menangani Error dari Digiflazz
        return res.status(500).json({ 
            message: 'Gagal Koneksi API', 
            error: error.response?.data?.message || error.message 
        });
    }
}
