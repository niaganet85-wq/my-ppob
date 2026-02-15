const axios = require('axios');
const crypto = require('crypto');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { action, sku, target, ref_id } = req.body;
    const MID = process.env.APIGAMES_ID;
    const KEY = process.env.APIGAMES_KEY;

    try {
        // --- 1. FITUR CEK SALDO (BARU) ---
        if (action === 'cek_saldo') {
            // Rumus Signature Cek Saldo: md5(merchant_id + secret_key)
            const signature = crypto.createHash('md5').update(MID + KEY).digest('hex');
            
            // Endpoint Profile/Saldo API Games
            const response = await axios.get(`https://v1.apigames.id/v2/merchant?merchant_id=${MID}&signature=${signature}`);
            
            return res.status(200).json(response.data);
        }

        // --- 2. FITUR TRANSAKSI ---
        // Rumus Signature Transaksi: md5(merchant_id + secret_key + ref_id)
        const signature = crypto.createHash('md5').update(MID + KEY + ref_id).digest('hex');

        const payload = {
            ref_id: ref_id,
            merchant_id: MID,
            produk: sku,
            tujuan: target,
            signature: signature
        };

        const response = await axios.post('https://v1.apigames.id/v2/transaksi', payload);
        return res.status(200).json(response.data);

    } catch (error) {
        return res.status(500).json({ 
            message: 'Gagal API Games', 
            error: error.response?.data || error.message 
        });
    }
}
