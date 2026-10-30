import multer from "multer";

const MAX_PDF_SIZE = 5 * 1024 * 1024;

const uploadResume = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_PDF_SIZE,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype !== "application/pdf") {
      callback(new Error("Please upload a PDF file."));
      return;
    }

    callback(null, true);
  },
});

export default uploadResume;
