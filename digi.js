const crypto = require('crypto');

export default async function handler(req, res) {
    // --- PENGATURAN ANDA ---
    const DIGI_USER = "isi_username_anda"; 
    const DIGI_KEY = "isi_api_key_anda";   
    const UNTUNG = 250; // Anda bisa ubah angka ini kapan saja
    // -----------------------

    if (req.method === 'POST') {
        const { sku, customer_no, ref_id } = req.body;
        const signature = crypto.createHash('md5')
            .update(DIGI_USER + DIGI_KEY + ref_id)
            .digest('hex');

        try {
            const response = await fetch('https://api.digiflazz.com/v1/transaction', {
                method: 'POST',
                body: JSON.stringify({
                    username: DIGI_USER,
                    buyer_sku_code: sku,
                    customer_no: customer_no,
                    ref_id: ref_id,
                    sign: signature
                })
            });

            const data = await response.json();
            
            // Logika Markup: Harga asli + Untung
            if (data.data) {
                data.data.price += UNTUNG; 
            }

            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: "Gagal menyambung ke Digiflazz" });
        }
    } else {
        res.status(405).json({ message: "Gunakan POST" });
    }
}
