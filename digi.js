const axios = require('axios');
const crypto = require('crypto');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { action, sku, target } = req.body;
    const DIGI_USER = process.env.DIGI_USER; 
    const DIGI_KEY = process.env.DIGI_KEY;

    try {
        // --- 1. CEK SALDO ---
        if (action === 'cek_saldo') {
            const sign = crypto.createHash('md5').update(DIGI_USER + DIGI_KEY + 'depo').digest('hex');
            const response = await axios.post('https://api.digiflazz.com/v1/cek-saldo', {
                cmd: 'depo', username: DIGI_USER, sign: sign
            });
            return res.status(200).json(response.data);
        }

        // --- 2. RIWAYAT TRANSAKSI ---
        if (action === 'riwayat') {
            const sign = crypto.createHash('md5').update(DIGI_USER + DIGI_KEY + 'history').digest('hex');
            const response = await axios.post('https://api.digiflazz.com/v1/transaction-history', {
                username: DIGI_USER, sign: sign, cmd: 'history'
            });
            return res.status(200).json(response.data);
        }

        // --- 3. CEK DAFTAR HARGA (BARU) ---
        if (action === 'harga') {
            const sign = crypto.createHash('md5').update(DIGI_USER + DIGI_KEY + 'pricelist').digest('hex');
            const response = await axios.post('https://api.digiflazz.com/v1/price-list', {
                cmd: 'prepaid', username: DIGI_USER, sign: sign
            });
            return res.status(200).json(response.data);
        }

        // --- 4. TRANSAKSI MEMBER ---
        if (!sku || !target) return res.status(400).json({ message: 'Data tidak lengkap' });

        const refId = 'NIAGA-' + Date.now();
        const sign = crypto.createHash('md5').update(DIGI_USER + DIGI_KEY + refId).digest('hex');
        const response = await axios.post('https://api.digiflazz.com/v1/transaction', {
            username: DIGI_USER, buyer_sku_code: sku, customer_no: target, ref_id: refId, sign: sign
        });

        return res.status(200).json(response.data);

    } catch (error) {
        return res.status(500).json({ message: 'Gagal API', error: error.message });
    }
}
