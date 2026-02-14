const axios = require('axios');
const crypto = require('crypto');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { action, sku, target } = req.body;
    const DIGI_USER = process.env.DIGI_USER; 
    const DIGI_KEY = process.env.DIGI_KEY;

    try {
        // Logika 1: Cek Saldo
        if (action === 'cek_saldo') {
            const sign = crypto.createHash('md5').update(DIGI_USER + DIGI_KEY + 'depo').digest('hex');
            const response = await axios.post('https://api.digiflazz.com/v1/cek-saldo', {
                username: DIGI_USER, key: DIGI_KEY, sign: sign
            });
            return res.status(200).json(response.data);
        }

        // Logika 2: Riwayat Transaksi & Mutasi
        if (action === 'riwayat' || action === 'mutasi') {
            const endpoint = action === 'riwayat' ? 'transaction-history' : 'deposit-history';
            const sign = crypto.createHash('md5').update(DIGI_USER + DIGI_KEY + 'history').digest('hex');
            const response = await axios.post(`https://api.digiflazz.com/v1/${endpoint}`, {
                username: DIGI_USER, key: DIGI_KEY, sign: sign
            });
            return res.status(200).json(response.data);
        }

        // Logika 3: Transaksi Member (Default)
        const refId = 'NIAGA-' + Date.now();
        const sign = crypto.createHash('md5').update(DIGI_USER + DIGI_KEY + refId).digest('hex');
        const response = await axios.post('https://api.digiflazz.com/v1/transaction', {
            username: DIGI_USER, buyer_sku_code: sku, customer_no: target, ref_id: refId, sign: sign
        });
        return res.status(200).json(response.data);

    } catch (error) {
        return res.status(500).json({ message: 'Error API', error: error.message });
    }
}
