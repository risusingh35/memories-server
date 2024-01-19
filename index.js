const express = require('express');
const fs = require('fs');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
const PORT = process.env.PORT || 5050; // Use a default value if PORT is not defined
const mongoURL = process.env.MONGO_URL
mongoose.connect(mongoURL);
  
const memorySchema = new mongoose.Schema({
  name: String,
  date: Date,
  imagePath: String,
});

const Memory = mongoose.model('Memory', memorySchema);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = `uploads/`;
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const timestamp = Date.now();
      cb(null, `${timestamp}.png`);
    }
  });

const upload = multer({ storage: storage });

app.post('/api/memories', upload.single('image'), async (req, res) => {
  try {
    const { name, date } = req.body;
    console.log(' req.file', req.file);
    const imagePath = req.file.path;

    const newMemory = new Memory({ name, date, imagePath });
    await newMemory.save();

    res.json(newMemory);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/memories', async (req, res) => {
  try {
    const memories = await Memory.find();
    res.json(memories);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
