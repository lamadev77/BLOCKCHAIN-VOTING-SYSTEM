const multer = require("multer");
const { UPLOAD_FOLDER_PATH } = require("../src/constants/index");

const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, UPLOAD_FOLDER_PATH);
  },
  filename: (req: any, file: any, cb: any) => {
    const orginalFileName = file.originalname.split(".");
    const fileName = `${orginalFileName[0]}-${Date.now()}.${orginalFileName[1]}`;
    console.log({ fileName })
    cb(null, fileName);
  }
});

const uploader = multer({ storage: storage });

module.exports = uploader;
