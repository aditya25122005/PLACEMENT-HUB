const multer = require("multer");
const fs = require("fs");
const path = require("path");

// ⭐ Ensure folder exists
const uploadPath = path.join(__dirname, "../uploads/dp");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const uploadDp = multer({ storage });

module.exports = uploadDp;
