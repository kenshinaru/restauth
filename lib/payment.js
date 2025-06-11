import qrcode from 'qrcode';
import FormData from 'form-data';
import axios from 'axios';
import { LRUCache } from 'lru-cache';

class Payment {
    constructor() {
        this.cache = new LRUCache({
            max: 1000,
            ttl: 1000 * 60 * 5 // 5 menit
        });
    }

    generateSessionId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return `KNS-${Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')}`;
    }

    formatDate(date) {
        const d = new Date(date);
        const pad = (num) => num.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }

    async uploadBuffer(input, filename) {
        try {
            const form = new FormData();
            form.append('file', input, filename);
            form.append('expiration', '5min');

            const { data } = await axios.post('https://cdn-arincy.vercel.app/api/upload', form, {
                headers: form.getHeaders()
            });

            if (!data?.status) throw new Error(data?.msg || 'Upload gagal');

            return {
                status: true,
                data: {
                    url: data.data.url,
                    filename
                }
            };
        } catch (e) {
            return {
                status: false,
                msg: e.message
            };
        }
    }

    async createPay(qrisData, amount) {
        if (!qrisData.includes("6304")) return { status: false, msg: "QRIS tidak valid" };

        // Hitung admin & totalPrice lebih awal
        const admin = Math.floor(Math.random() * 100) + 1;
        const totalPrice = Number(amount) + admin;

        // Siapkan QRIS string pakai totalPrice
        let baseQris = qrisData.replace("010211", "010212").slice(0, -4);
        let amountTag = `54${totalPrice.toString().length.toString().padStart(2, "0")}${totalPrice}`;
        let insertPos = baseQris.includes("5802ID") ? baseQris.indexOf("5802ID") : baseQris.indexOf("5204") + 8;
        let finalQris = baseQris.slice(0, insertPos) + amountTag + baseQris.slice(insertPos);

        // CRC
        let crc = 0xffff, poly = 0x1021;
        for (let byte of Buffer.from(finalQris, "ascii")) {
            crc ^= (byte << 8);
            for (let i = 0; i < 8; i++) {
                crc = (crc & 0x8000) ? (crc << 1) ^ poly : crc << 1;
                crc &= 0xffff;
            }
        }
        finalQris += crc.toString(16).toUpperCase().padStart(4, "0");

        // Generate QR & upload
        const sessionId = this.generateSessionId();
        const qrBuffer = await qrcode.toBuffer(finalQris, { scale: 5 });

        const filename = `qris-${Date.now()}.png`;
        const uploadRes = await this.uploadBuffer(qrBuffer, filename);

        if (!uploadRes.status) {
            return { status: false, msg: 'Gagal upload QR ke CDN: ' + uploadRes.msg };
        }

        // Simpan data transaksi
        const createdAt = new Date();
        const expiredAt = new Date(createdAt.getTime() + 5 * 60000);

        const paymentData = {
            state: "Pending",
            token: sessionId,
            pay_method: "QRIS",
            qris_url: uploadRes.data.url,
            admin,
            amount,
            total_price: totalPrice,
            create_at: this.formatDate(createdAt),
            expired_at: this.formatDate(expiredAt)
        };

        this.cache.set(sessionId, paymentData);

        return { status: true, data: paymentData };
    }

    async checkPay(ok_id, ok_apikey, paymentId) {
        const payment = this.cache.get(paymentId);
        if (!payment) {
            return { status: false, msg: "Transaksi tidak ditemukan atau mungkin expired" };
        }

        const url = `https://gateway.okeconnect.com/api/mutasi/qris/${ok_id}/${ok_apikey}`;
        let response;

        try {
            response = await axios.get(url);
        } catch {
            return { status: false, msg: "Gagal mengambil data transaksi, mungkin apikey atau id orderkuota kamu salah!" };
        }

        const data = response.data;
        if (data.message === "no data") {
            return {
                status: true,
                msg: "Transaksi ditemukan!",
                data: { ...payment, paid_at: null }
            };
        }

        const transaction = data.data.find(item =>
            item.type === "CR" &&
            item.qris === "static" &&
            parseInt(item.amount) === payment.total_price
        );

        if (transaction) {
            payment.state = "Settlement";
            payment.paid_at = transaction.date;
            this.cache.set(paymentId, payment);
        }

        return {
            status: true,
            msg: "Transaksi ditemukan!",
            data: { ...payment }
        };
    }
}

export default new Payment();
