import { Request, Response } from 'express';

const { UPLOAD_FOLDER_PATH } = require("../../../constants/index");

const uploadFile = async (req: Request, res: Response) => {
  try {
    const arr = req?.files as Express.Multer.File[];

    const imgHostedURL: string[] = [];
    arr.forEach(d => {
      const uploadFilepath = UPLOAD_FOLDER_PATH + d.filename;
      imgHostedURL.push(uploadFilepath)
    })

    res.status(200).send({
      message: "File uploaded successfully",
      url: imgHostedURL,
      statusCode: 200
    });
  } catch (error) {
    console.error(error)
    res.status(500).send({
      message: "Internal Server Error.",
      url: null,
      statusCode: 500
    });
  }
};

module.exports = {
  uploadFile
}