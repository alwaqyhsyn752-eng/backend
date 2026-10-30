const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(cors());
app.use(express.json());

// إعدادات البريد الإلكتروني (تقرأ من متغيرات البيئة في Render)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// إعداد بوت تلغرام (تقرأ من متغيرات البيئة في Render)
let bot;
if (process.env.TG_TOKEN) {
  bot = new TelegramBot(process.env.TG_TOKEN);
}

// 1. مسار إرسال كود OTP
app.post('/api/send-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'بيانات ناقصة' });

  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail({
        from: '"متجر النخبة" <' + process.env.EMAIL_USER + '>',
        to: email,
        subject: 'كود التحقق الخاص بك',
        text: 'كود التحقق الخاص بك هو: ' + otp
      });
    }
    res.json({ success: true, message: 'تم الإرسال' });
  } catch (error) {
    console.error('Email Error:', error);
    res.status(500).json({ success: false, error: 'فشل الإرسال' });
  }
});

// 2. مسار استقبال طلب جديد وإرساله لتلغرام
app.post('/api/new-order', async (req, res) => {
  const order = req.body;
  const message = `🛒 *طلب جديد!*\n👤 العميل: ${order.name}\n📞 الهاتف: ${order.phone}\n💰 الإجمالي: ${order.total} ر.س`;
  
  try {
    if (bot && process.env.TG_CHAT_ID) {
      await bot.sendMessage(process.env.TG_CHAT_ID, message, { parse_mode: 'Markdown' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Telegram Error:', error);
    res.status(500).json({ success: false });
  }
});

app.get('/', (req, res) => res.send('✅ الخادم الخلفي جاهز لاستقبال الطلبات!'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
