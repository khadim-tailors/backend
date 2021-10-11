const express = require("express");
const shops = express.Router();
const admin = require("firebase-admin");
const { sendResponse } = require("../helper/response.helper");
const shopRef = admin.firestore().collection("shops");
const cors = require("cors");
shops.use(cors({ origin: true }));

shops.post("/addShop", async (req, res) => {
    try {
        const data = req.body;
        const shop = await shopRef.add(req.body);
        sendResponse({ res, message: "Shop added successfully.", status: true, result: shop.id });
    } catch (error) {
        sendResponse({ res, message: error.message ? error.message : "Shop added successfully.", status: false, result: [] });

    }

});

shops.get("/fetchShops", async (req, res) => {
    try {
        const allShops = [];
        const shop = await shopRef.get(req.body);
        shop.forEach(doc => {
            allShops.push({ shop_id: doc.id, ...doc.data() });
        });
        sendResponse({ res, message: "Shop added successfully.", status: true, result: allShops });
    } catch (error) {
        sendResponse({ res, message: error.message ? error.message : "Shop added successfully.", status: false, result: [] });

    }

});

module.exports = shops;
