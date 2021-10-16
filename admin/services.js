const express = require("express");
const services = express.Router();
const admin = require("firebase-admin");
const { sendResponse } = require("../helper/response.helper");
const servicesRef = admin.firestore().collection("services");
const cors = require("cors");
services.use(cors({ origin: true }))

services.post("/addService", async (req, res) => {
  const data = req.body;
  try {
    const service = await servicesRef.add(data);
    sendResponse({ res, message: "service added successfully", status: true, result: service });
  } catch (error) {

  }
});
services.post("/updateService", async (req, res) => {
  const data = req.body;
  const { service_id } = data;
  const service = servicesRef.doc(service_id).update(data);
});

module.exports = services;