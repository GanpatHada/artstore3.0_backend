const multer = require("multer");
const fs = require("fs");
const path = require("path");

const tempDir = path.join(process.cwd(), "public/temp");

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (_, _, cb) {
    cb(null, tempDir);
  },
  filename: function (_, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });
module.exports = upload;
