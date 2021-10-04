const express = require("express");
const admin = require("firebase-admin");
const { sendResponse } = require("../helper/response.helper");
const profile = express.Router();
profile.post("/getProfile", async (req, res) => {
    const { user_id } = req.body;
    const profiles = [];
    const profileResult = await admin.firestore().collection('profiles').where('user_id', '==', user_id).get();
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
});
profile.post("/addOrUpdateProfile", async (req, res) => {
    const { body } = req;
    const { user_id } = body;
    const profiles = [];
    const profileResult = await admin.firestore().collection('profiles').get();
    profileResult.forEach(profile => {
        const obj = {
            profile_id: profile.id,
            ...profile.data()
        };
        profiles.push(obj);
    });
    isProfileAlreadyExist = profiles.find(profile => profile.user_id === user_id);
    if (isProfileAlreadyExist) {
        admin.firestore().collection('profiles').doc(isProfileAlreadyExist.profile_id).update(body)
            .then(response => {
                sendResponse({ res, message: 'Profile Updated successfully!', status: true, result: [] });
            })
            .catch(error => {
                sendResponse({ res, message: 'Profile Updated failed!', status: false, result: error });
            });
    } else {
        const profileDetails = await admin.firestore().collection('profiles').add(body);
        res.json(profileDetails);
    }
});


module.exports = profile;
