const axios = require('axios');
const crypto = require('crypto');
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({message:'Method Not Allowed'});
    const { action, sku, target } = req.body;
    const U = process.env.DIGI_USER; const K = process.env.DIGI_KEY;
    try {
        if(action==='cek_saldo'){
            const sign = crypto.createHash('md5').update(U+K+'depo').digest('hex');
            const r = await axios.post('https://api.digiflazz.com/v1/cek-saldo',{cmd:'depo',username:U,sign:sign});
            return res.json(r.data);
        }
        if(action==='riwayat'){
            const sign = crypto.createHash('md5').update(U+K+'history').digest('hex');
            const r = await axios.post('https://api.digiflazz.com/v1/transaction-history',{username:U,sign:sign,cmd:'history'});
            return res.json(r.data);
        }
        if(action==='harga'){
            const sign = crypto.createHash('md5').update(U+K+'pricelist').digest('hex');
            const r = await axios.post('https://api.digiflazz.com/v1/price-list',{cmd:'prepaid',username:U,sign:sign});
            return res.json(r.data);
        }
        const ref = 'GK-'+Date.now();
        const sign = crypto.createHash('md5').update(U+K+ref).digest('hex');
        const r = await axios.post('https://api.digiflazz.com/v1/transaction',{username:U,buyer_sku_code:sku,customer_no:target,ref_id:ref,sign:sign});
        return res.json(r.data);
    } catch(e){return res.status(500).json({error:e.message})}
}
