const express = require("express");
const plans = express.Router();
const admin = require("firebase-admin");
const { sendResponse } = require("../helper/response.helper");
const plansRef = admin.firestore().collection("plans");

plans.post("/addNewPlan", (req, res) => {
  const data = req.body;
  try {
    const plansSnapshot = plansRef.add(data);
    return sendResponse({ res, message: "Plan added successfully.", status: true, result: plansSnapshot.id });
  } catch (error) {
    return sendResponse({ res, message: error.message ? error.message : "Failed to add a new plan.", status: true, result: [] });
  }
});

module.exports = plans;