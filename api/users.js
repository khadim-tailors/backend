const express = require('express');
const users = express.Router();
const admin = require("firebase-admin");
const moment = require("moment");
const { sendResponse } = require("../helper/response.helper");
const usersRef = admin.firestore().collection('users');
const profileRef = admin.firestore().collection('profiles');
const cors = require('cors');
users.use(cors({ origin: true }));

users.post("/createNewUser", async (req, res) => {
  const { user_id } = req.body;
  try {
    admin
      .auth()
      .getUser(user_id)
      .then(async (userRecord) => {
        // See the UserRecord reference doc for the contents of userRecord.
        const user = {
          email: userRecord.email,
          emailVerified: userRecord.emailVerified,
          disabled: userRecord.disabled,
          creationTime: moment(userRecord.metadata.creationTime).format("DD-MMM-YYYY HH:mm:ss"),
          phone: userRecord.phone,
          is_profile_filled: false,
          plan: {
            name: 'Free',
            order_used: 0,
            end_date: moment().add(1, 'M').format('DD-MM-YYYY HH:mm:ss'),
            star_date: moment().format("DD-MM-YYYY HH:mm:ss"),
            order_left: 10,
            total_order_count: 10,
            order_used: 0

          }
        };
        if (!user.email) delete user.email;
        if (!user.phone) delete user.phone;
        console.log(user);
        const snapshot = await admin.firestore().collection('users').doc(user_id).set(user);
        return sendResponse({ res, message: "User creation successful.", result: user, status: true });
      })
      .catch((error) => {
        return sendResponse({ res, message: error.message ? error.message : "Something went wrong", result: [], status: false });
      });
  } catch (error) {
    sendResponse({ res, message: error.message ? error.message : "Failed to create a new user", status: false, result: [] });
  }

});

users.post("/getUser", async (req, res) => {
  const { user_id } = req.body;
  try {
    const snapshot = await admin.firestore().collection('users').doc(user_id).get();
    return sendResponse({ res, message: "User fetched successfully.", status: true, result: { user_id: snapshot.id, ...snapshot.data() } });
  } catch (error) {
    return sendResponse({ res, message: error.message ? error.message : "Failed to get the user details.", result: [], status: false, });
  }
});

users.post("/updateUser", async (req, res) => {
  const { body } = req;
  try {
    const response = await admin.firestore().collection("users").doc(body.user_id).update(body);
    sendResponse({ res, message: "User updated successfully.", result: response, status: true, });
  } catch (error) {
    return sendResponse({ res, message: error.message ? error.message : "User update failed.", result: [], status: false, });

  }
});

users.get("/getAllUsers", async (req, res) => {
  try {
    const allUsers = [];
    const users = await usersRef.get();
    users.forEach(user => {
      allUsers.push({ user_id: user.id, ...user.data() });
    });
    return sendResponse({ res, message: "Users fetched successfully.", status: true, result: allUsers });
  } catch (err) {
    return sendResponse({ res, message: "Users fetch failed.", status: false, result: [] });
  }
});

users.get("/getAllUsersForAdmin", async (req, res) => {
  try {
    const allUsers = [];
    const usersWithRequiredData = []
    const users = await usersRef.get();
    users.forEach(user => {
      const data = {...user.data()}
      const { first_name, last_name, email, phone, address, city, state } = data
      allUsers.push({ user_id: user.id, first_name, last_name, email, phone, address, city, state, plan: data.plan.name });
    });
    return sendResponse({ res, message: "Users fetched successfully.", status: true, result: allUsers });
  } catch (err) {
    return sendResponse({ res, message: err.message || "Users fetch failed.", status: false, result: [] });
  }
});

module.exports = users;