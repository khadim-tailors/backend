const express = require("express");
const gallery = express.Router();
const admin = require("firebase-admin");
const { sendResponse } = require("../helper/response.helper");
const galleryRef = admin.firestore().collection("gallery");
const cors = require("cors");
gallery.use(cors({ origin: true }));
const { uuid } = require("uuidv4");

gallery.post("/addFolder", async (req, res) => {
  const { folder, image } = req.body;
  if (
    (folder && typeof folder === "string") ||
    (image && typeof image === "string")
  ) {
    try {
      const gallerySnapshot = await galleryRef
        .doc(folder)
        .set({ images: [{ id: uuid(), url: image }] });
      return sendResponse({
        res,
        message: "Folder successfully.",
        status: true,
        result: gallerySnapshot.id,
      });
    } catch (error) {
      return sendResponse({
        res,
        message: error.message ? error.message : "Failed to add a new plan.",
        status: true,
        result: [],
      });
    }
  } else
    return sendResponse({
      res,
      message: "Invalid inputs sent in the request",
      status: false,
      result: [],
    });
});

const getRestOfTheData = (doc) => {
  const data = { ...doc.data() };
  return {
    image: data.images[0],
    length: data.images.length,
  };
};

gallery.get("/fetchGallery", async (req, res) => {
  try {
    const folders = [];
    const gallerySnapshot = await galleryRef.get();
    gallerySnapshot.forEach((doc) => {
      folders.push({ folderName: doc.id, ...getRestOfTheData(doc) });
    });
    return sendResponse({
      res,
      message: "Galary fetched successfully.",
      status: true,
      result: folders,
    });
  } catch (error) {
    return sendResponse({
      res,
      message: error.message ? error.message : "Failed to fetch plans.",
      status: true,
      result: [],
    });
  }
});

gallery.get("/folder/:folderName", async (req, res) => {
  try {
    const { folderName } = req.params;
    if (!folderName || typeof folderName !== "string")
      return sendResponse({
        res,
        message: "invalid foldername given in the request.",
        result: [],
        status: false,
      });
    const gallerySnapshot = await galleryRef.doc(folderName).get();
    return sendResponse({
      res,
      message: "Galary fetched successfully.",
      status: true,
      result: { ...gallerySnapshot.data() },
    });
  } catch (error) {
    return sendResponse({
      res,
      message: error.message ? error.message : "Failed to fetch plans.",
      status: true,
      result: [],
    });
  }
});

gallery.post("/addImage", async (req, res) => {
  const { folderName, image } = req.body;
  if (
    folderName &&
    typeof folderName === "string" &&
    image &&
    typeof image === "string"
  ) {
    try {
      const allImages = await getAllImagesFromTheFolder(folderName);
      allImages.unshift({ id: uuid(), url: image });
      const updatedImages = await galleryRef
        .doc(folderName)
        .update({ images: allImages });
      return sendResponse({
        res,
        message: "Image add successfully.",
        result: allImages,
        status: true,
      });
    } catch (error) {
      return sendResponse({
        res,
        message: error.message ? error.message : "Image add failed.",
        result: [],
        status: false,
      });
    }
  } else
    return sendResponse({
      res,
      message: "Invalid inputs passed in the request.",
      status: false,
      result: [],
    });
});

gallery.post("/deleteImage", async (req, res) => {
  try {
    const { id, folderName } = req.body;
    let allImages = await getAllImagesFromTheFolder(folderName);
    const imageIndexToBeDelete = allImages.findIndex(
      (image) => image.id === id
    );
    console.log("imageIndexToBeDelete",imageIndexToBeDelete)
    const deletedImage = await deleteImageFromStore(allImages[imageIndexToBeDelete].url);
    console.log("allImages",allImages);
    allImages =  allImages.filter(image => image.id !== id)
    if (allImages.length === 0) {
      //All images deleted, delete the folder also
      const deletedDoc = await galleryRef.doc(folderName).delete();
    } else {
      //Only one image is deleted, return the rest of the images
      const updatedDoc = await galleryRef
        .doc(folderName)
        .update({ images: allImages });
    }
    return sendResponse({
      res,
      message: "Image deleted successfully.",
      status: true,
      result: deletedImage,
    });
  } catch (error) {
    return sendResponse({
      res,
      message: error.message ? error.message : "Failed to delete plan.",
      status: true,
      result: [],
    });
  }
});

const getAllImagesFromTheFolder = async (folderName) => {
  const images = await galleryRef.doc(folderName).get();
  const allImagesOfFolder = { ...images.data() };
  return allImagesOfFolder.images;
};

const deleteImageFromStore = async (url) => {
  const storage = admin.storage();
  const imagePath = getPathStorageFromUrl(url);
  const deletedStorage =  await storage
    .bucket()
    .file(imagePath)
    .delete()
    .catch((err) => console.error(err));
  return deletedStorage
};

function getPathStorageFromUrl(url) {
  const baseUrl = "https://firebasestorage.googleapis.com/v0/b/khadim-tailors.appspot.com/o/";
  let imagePath = url.replace(baseUrl, "");
  const indexOfEndPath = imagePath.indexOf("?");
  imagePath = imagePath.substring(0, indexOfEndPath);
  imagePath = imagePath.replace("%2F", "/");
  return imagePath;
}
module.exports = gallery;
