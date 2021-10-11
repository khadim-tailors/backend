const functions = require("firebase-functions");
const moment = require("moment")
const express = require("express");
const app = express();
const admin = require("firebase-admin");
admin.initializeApp();
const profiles = require("./api/profile");
const customer = require("./api/customers");
const employee = require("./api/employees");
const user = require("./api/users");
const service = require("./admin/services");
const plan = require("./admin/plans");
const shop = require("./admin/shops")
const dashboard = require("./admin/dashboard");
const { sendResponse } = require("./helper/response.helper");

app.post("/createNewUser", async (req, res) => {
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
                  phone:userRecord.phone,
              }
              if(!user.email) delete user.email;
              if(!user.phone) delete user.phone;
              console.log(user)
              const snapshot = await admin.firestore().collection('users').doc(user_id).set(user);
              return sendResponse({res, message: "User creation successful.", result: user, status: true})
          })
          .catch((error) => {
              return sendResponse({res, message:error.message ? error.message : "Something went wrong", result:[], status: false})
          });
    } catch (error) {
        sendResponse({ res,message: error.message? error.message :"Failed to create a new user", status:false , result: []});
    }
   
});
app.post("/getUsers", async (req, res) => {
    const { id } = req.body;
    const snapshot = await admin.firestore().collection('users').doc(id).get();
    return res.json({ id: snapshot.id, ...snapshot.data() });
});

app.post("/update-user", async (req, res) => {
    const { body } = req;
    const response = await admin.firestore().collection("users").doc(body.id).update(body);
    res.json(response);
});

exports.users = functions.https.onRequest(app);
exports.profile = functions.https.onRequest(profiles);
exports.customers = functions.https.onRequest(customer);
exports.employees = functions.https.onRequest(employee);
exports.services = functions.https.onRequest(service);
exports.plans = functions.https.onRequest(plan);
exports.dashboards = functions.https.onRequest(dashboard);
exports.shops =  functions.https.onRequest(shop)
