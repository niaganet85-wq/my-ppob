const axios = require('axios');
const crypto = require('crypto');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { action, sku, target } = req.body;
    const USER = process.env.DIGI_USER; 
    const KEY = process.env.DIGI_KEY;

    try {
        // 1. CEK SALDO
        if (action === 'cek_saldo') {
            const sign = crypto.createHash('md5').update(USER + KEY + 'depo').digest('hex');
            const response = await axios.post('https://api.digiflazz.com/v1/cek-saldo', {
                cmd: 'depo', username: USER, sign: sign
            });
            return res.status(200).json(response.data);
        }

        // 2. RIWAYAT TRANSAKSI
        if (action === 'riwayat') {
            const sign = crypto.createHash('md5').update(USER + KEY + 'history').digest('hex');
            const response = await axios.post('https://api.digiflazz.com/v1/transaction-history', {
                username: USER, sign: sign, cmd: 'history'
            });
            return res.status(200).json(response.data);
        }

        // 3. CEK HARGA (PRICELIST)
        if (action === 'harga') {
            const sign = crypto.createHash('md5').update(USER + KEY + 'pricelist').digest('hex');
            const response = await axios.post('https://api.digiflazz.com/v1/price-list', {
                cmd: 'prepaid', username: USER, sign: sign
            });
            return res.status(200).json(response.data);
        }

        // 4. TRANSAKSI TOP UP
        const refId = 'GK-' + Date.now(); // ID Unik Game Ku
        const sign = crypto.createHash('md5').update(USER + KEY + refId).digest('hex');
        
        const response = await axios.post('https://api.digiflazz.com/v1/transaction', {
            username: USER, buyer_sku_code: sku, customer_no: target, ref_id: refId, sign: sign
        });

        return res.status(200).json(response.data);

    } catch (error) {
        return res.status(500).json({ message: 'Gagal Koneksi Digiflazz', error: error.message });
    }
}
