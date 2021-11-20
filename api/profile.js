const express = require("express");
const admin = require("firebase-admin");
const { sendResponse } = require("../helper/response.helper");
const profile = express.Router();
const cors = require("cors");
const { isUserIdValid } = require("../helper/helper");
profile.use(cors({ origin: true }));
const profileRef = admin.firestore().collection("profiles");
const userRef = admin.firestore().collection("users");

profile.post("/getProfile", async (req, res) => {
  const { user_id } = req.body;
  const profiles = [];
  if (user_id) {
    const profileResult = await profileRef.where('user_id', '==', user_id).get();
    profileResult.forEach(profile => {
      const obj = {
        profile_id: profile.id,
        ...profile.data()
      };
      profiles.push(obj);
    });
    if (profiles.length > 0) {
      sendResponse({ res, message: 'Profile Fetched successfully!', status: true, result: profiles[0] });
    } else {
      sendResponse({ res, message: 'No profile found!', status: false, result: [] });
    }
  } else return sendResponse({ res, message: 'User id is missing.', status: false, result: [] });
});
profile.post("/addOrUpdateProfile", async (req, res) => {
  const { body } = req;
  const { user_id } = body;
  try {
    if (!isUserIdValid(user_id)) return sendResponse({ res, message: "Invalid User id", result: [], status: false });
    const profileSnapshot = await profileRef.doc(user_id).get();
    let extraDetails = {};
    if(body.address) extraDetails.address = body.address
    if(body.city) extraDetails.city = body.city
    if(body.state) extraDetails.state = body.state
    if(body.lat) extraDetails.lat = body.lat
    if(body.long) extraDetails.long = body.long
    if(body.first_name) extraDetails.first_name = body.first_name
    if(body.last_name) extraDetails.last_name = body.last_name
    if(body.phone) extraDetails.phone = body.phone
    if(body.phone_num) extraDetails.phone_num = body.phone_num
    const users = await userRef.doc(user_id).set({...extraDetails}, {merge:true});
    if (profileSnapshot.exists) {
      const updatedProfile = await profileRef.doc(user_id).update(body);
      return sendResponse({ res, message: "Profile updated successfully.", result: updatedProfile, status: true });
    } else {
      const addProfile = await profileRef.doc(user_id).set(req.body);
      const users = await userRef.doc(user_id).update({ is_profile_filled: true });
      return sendResponse({ res, message: "Profile added successfully.", status: true, result: { addProfile, ...users } });
    }
  } catch (err) {
    return sendResponse({ res, message: err.message ? err.message : "Profile add/update failed.", status: false, result: [] });
  }
});


module.exports = profile;
