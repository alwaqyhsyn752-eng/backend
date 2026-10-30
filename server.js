const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// نقطة اختبار للتأكد من عمل الخادم
app.get('/', (req, res) => res.send('✅ الخادم الخلفي يعمل بنجاح!'));

// هنا سنضيف مسارات إرسال OTP والطلبات لاحقاً
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
