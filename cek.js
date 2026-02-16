// File: api/cek.js
const crypto = require('crypto');

module.exports = async (req, res) => {
    // 1. Izinkan Akses (CORS)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Jika browser cuma ping/tanya
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Ambil data dari Body
    const { memberID, apiKey, secretKey } = req.body;

    if (!memberID || !apiKey || !secretKey) {
        return res.status(400).json({ error: 'Data MemberID/API Key/Secret Kosong!' });
    }

    // 2. Buat Signature (MD5)
    // Rumus: memberID:apiKey:secretKey
    const rawSign = `${memberID}:${apiKey}:${secretKey}`;
    const signature = crypto.createHash('md5').update(rawSign).digest('hex');

    try {
        // 3. Tembak BukaOlshop
        const response = await fetch('https://bukaolshop.net/api/v1/member/saldo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                memberID: memberID,
                api_key: apiKey,
                sign: signature
            })
        });

        const data = await response.json();
        
        // Kembalikan jawaban ke layar
        res.status(200).json(data);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
