const express = require("express");
const plans = express.Router();
const admin = require("firebase-admin");
const { sendResponse } = require("../helper/response.helper");
const plansRef = admin.firestore().collection("plans");

plans.post("/addNewPlan", async (req, res) => {
  const data = req.body;
  try {
    const plansSnapshot = await plansRef.add(data);
    return sendResponse({ res, message: "Plan added successfully.", status: true, result: plansSnapshot.id });
  } catch (error) {
    return sendResponse({ res, message: error.message ? error.message : "Failed to add a new plan.", status: true, result: [] });
  }
});

plans.get("/fetchPlans", async (req, res) => {
  try {
    const allPlans = [];
    const plansSnapshot = await plansRef.get();
    plansSnapshot.forEach(doc => {
      allPlans.push({ plan_id: doc.id, ...doc.data() });
    });
    return sendResponse({ res, message: "Plans fetched successfully.", status: true, result: allPlans });
  } catch (error) {
    return sendResponse({ res, message: error.message ? error.message : "Failed to fetch plans.", status: true, result: [] });
  }
});

plans.post("/updatePlan", async (req, res) => {
  try {
    const { plan_id } = req.body;
    const plansSnapshot = await plansRef.doc(plan_id).update(req.body);
    return sendResponse({ res, message: "Plan updated successfully.", status: true, result: plansSnapshot });
  } catch (error) {
    return sendResponse({ res, message: error.message ? error.message : "Failed to update plan.", status: true, result: [] });
  }
});
plans.post("/deletePlan", async (req, res) => {
  try {
    const { plan_id } = req.body;
    const plansSnapshot = await plansRef.doc(plan_id).delete();
    return sendResponse({ res, message: "Plan deleted successfully.", status: true, result: plansSnapshot });
  } catch (error) {
    return sendResponse({ res, message: error.message ? error.message : "Failed to delete plan.", status: true, result: [] });
  }
});
module.exports = plans;