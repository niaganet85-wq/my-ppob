const axios = require('axios');
const crypto = require('crypto');
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({message:'Method Not Allowed'});
    const { sku, target, ref_id } = req.body;
    const ID = process.env.APIGAMES_ID; const KEY = process.env.APIGAMES_KEY;
    try {
        const sign = crypto.createHash('md5').update(ID+KEY+ref_id).digest('hex');
        const r = await axios.post('https://v1.apigames.id/v2/transaksi',{
            ref_id:ref_id, merchant_id:ID, produk:sku, tujuan:target, signature:sign
        });
        return res.json(r.data);
    } catch(e){return res.status(500).json({error:e.message})}
}
