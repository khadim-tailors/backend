const express = require("express");
const shops = express.Router();
const admin = require("firebase-admin");
const { sendResponse } = require("../helper/response.helper");
const shopRef = admin.firestore().collection("shops");
const cors = require("cors");
const validateShop = require("../validators/shopValidator");
shops.use(cors({ origin: true }));

shops.post("/addShop", validateShop, async (req, res) => {
  try {
    const data = req.body;
    const shop = await shopRef.add(req.body);
    sendResponse({ res, message: "Shop added successfully.", status: true, result: shop.id });
  } catch (error) {
    sendResponse({ res, message: error.message ? error.message : "Shop added failed.", status: false, result: [] });

  }

});

shops.get("/fetchShops", async (req, res) => {
  try {
    const allShops = [];
    const shop = await shopRef.get(req.body);
    shop.forEach(doc => {
      allShops.push({ shop_id: doc.id, ...doc.data() });
    });
    sendResponse({ res, message: "Shop fetched successfully.", status: true, result: allShops });
  } catch (error) {
    sendResponse({ res, message: error.message ? error.message : "Shop fetch failed.", status: false, result: [] });

  }
});

shops.post("/updateShop", async (req, res) => {
  try {
    console.log("update shop is running");
    const { shop_id } = req.body;
    if (shop_id) {
      const shop = await shopRef.doc(shop_id).update(req.body);
      return sendResponse({ res, message: "Shop updated successfully.", status: true, result: shop });
    } else return sendResponse({ res, message: "Invalid shop id passed.", result: [], status: false });
  } catch (error) {
    sendResponse({ res, message: error.message ? error.message : "Shop update failed.", status: false, result: [] });

  }
});

shops.post("/toggleShop", async (req, res) => {
  const { shop_id } = req.body;
  try {
    if (shop_id) {
      let shopDetails = await shopRef.doc(shop_id).get();
      shopDetails = { shop_id: shopDetails.id, ...shopDetails.data() };
      const shop = await shopRef.doc(shop_id).update({ status: !shopDetails.status });
      return sendResponse({ res, message: "Shop deactivated successfully.", result: shop, status: true });
    } else return sendResponse({ res, message: "Invalid shop id passed.", result: [], status: false });
  } catch (error) {
    sendResponse({ res, message: error.message ? error.message : "Invalid shop id passed.", result: [], status: false });
  }
});

shops.post("/getShopById", async (req, res) => {
  const { shop_id } = req.body;
  try {
    if (shop_id) {
      let shopDetails = await shopRef.doc(shop_id).get();
      shopDetails = { shop_id: shopDetails.id, ...shopDetails.data() };
      return sendResponse({ res, message: "Shop fetched successfully.", result: shopDetails, status: true });
    } else return sendResponse({ res, message: "Invalid shop id passed.", result: [], status: false });
  } catch (error) {
    sendResponse({ res, message: error.message ? error.message : "Invalid shop id passed.", result: [], status: false });
  }
});

module.exports = shops;
