const express = require("express");
const { sendResponse } = require("../helper/response.helper");
const orders = express.Router();
orders.post("/getOrders", async (req, res) => {
    sendResponse({ res, message: "orders fetched successfully!", status: true, result: [] });
});
orders.post("/addOrder", async (req, res) => {
    sendResponse({ res, message: "orders fetched successfully!", status: true, result: [] });
});
module.exports = orders;