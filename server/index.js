const express = require('express');
const bodyParser = require('body-parser');
const xlsx = require('xlsx');
const cors = require('cors');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

app.post('/olustur-excel', (req, res) => {
  const { data } = req.body;
  const ws = xlsx.utils.json_to_sheet(data);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Projeler');
  xlsx.writeFile(wb, 'proje-listesi.xlsx');
  res.download('proje-listesi.xlsx');
});

app.post('/yukle-excel', upload.single('dosya'), (req, res) => {
  try {
    const dosya = req.file;
    if (!dosya) {
      return res.status(400).json({ hata: 'Yüklenen dosya bulunamadı' });
    }

    const workbook = xlsx.readFile(dosya.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    return res.json(data);
  } catch (error) {
    console.error('Excel dosyası yüklenirken hata oluştu', error);
    return res.status(500).json({ hata: 'İç Sunucu Hatası' });
  }
});

app.listen(port, () => {
  console.log(`Sunucu http://localhost:${port} üzerinde çalışıyor`);
});
