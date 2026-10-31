import multer from "multer";
import { MAX_PDF_SIZE } from "../config/limits.js";
import { HttpError } from "../utils/http-error.js";

const uploadResume = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_PDF_SIZE,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype !== "application/pdf") {
      callback(new HttpError("Please upload a PDF file.", 400));
      return;
    }

    callback(null, true);
  },
});

export default uploadResume;
