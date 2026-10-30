const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(cors());
app.use(express.json());

// إعداد البريد
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// إعداد تلغرام
let bot;
if (process.env.TG_TOKEN) {
  bot = new TelegramBot(process.env.TG_TOKEN);
}

app.post('/api/send-otp', async (req, res) => {
  const { email, otp, name, phone, location } = req.body;
  
  try {
    // 1. إرسال البريد للعميل
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        await transporter.sendMail({
          from: '"متجر النخبة" <' + process.env.EMAIL_USER + '>',
          to: email,
          subject: 'كود التحقق الخاص بك',
          html: `<div dir="rtl" style="font-family: Arial; padding: 20px; text-align: center;">
            <h2>مرحباً ${name || ''}</h2>
            <p>كود التحقق الخاص بك هو:</p>
            <h1 style="color: #d4af37; font-size: 40px; letter-spacing: 5px;">${otp}</h1>
          </div>`
        });
      } catch(e) { console.log('Email error:', e.message); }
    }
    
    // 2. إرسال إشعار للمدير على تلغرام (المراقبة)
    if (bot && process.env.TG_CHAT_ID) {
      const locText = location ? `\n📍 <a href="https://www.google.com/maps?q=${location.lat},${location.lng}">اضغط لعرض موقع العميل</a>` : '\n📍 لا يوجد موقع';
      
      const adminMsg = `
🔐 <b>طلب تحقق جديد</b>
👤 <b>الاسم:</b> ${name || 'غير محدد'}
📧 <b>البريد:</b> ${email}
📱 <b>الهاتف:</b> ${phone || 'غير محدد'}
🔑 <b>الكود:</b> <code>${otp}</code>${locText}

<i>راجع البيانات، وإذا كان مشبوهاً احظره من لوحة الإدارة.</i>
      `;
      
      await bot.sendMessage(process.env.TG_CHAT_ID, adminMsg, { 
        parse_mode: 'HTML',
        disable_web_page_preview: true 
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false });
  }
});

app.get('/', (req, res) => res.send('✅ الخادم يعمل'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
