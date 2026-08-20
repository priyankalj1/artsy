const fs = require("fs");
const path = require("path");

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Saves multipart file under uploads/<subfolder>/...
 * Returns relative path without leading slash: uploads/artists/1/profile/x.jpg
 */
const saveUploadedFile = (file, subfolder = "misc") =>
  new Promise((resolve, reject) => {
    const cleanFolder = String(subfolder || "misc")
      .replace(/\.\./g, "")
      .replace(/^\/+|\/+$/g, "");
    const uploadRoot = path.join(__dirname, "../../uploads", cleanFolder);
    ensureDir(uploadRoot);

    const original = String(file.name || "file").replace(/\s+/g, "_");
    const safeName = `${Date.now()}-${original}`;
    const dest = path.join(uploadRoot, safeName);

    file.mv(dest, (err) => {
      if (err) return reject(err);
      const relativePath = `uploads/${cleanFolder}/${safeName}`.replace(
        /\\/g,
        "/"
      );
      resolve({
        filename: safeName,
        path: relativePath,
        mimetype: file.mimetype,
        size: file.size,
      });
    });
  });

module.exports = {
  ensureDir,
  saveUploadedFile,
};
