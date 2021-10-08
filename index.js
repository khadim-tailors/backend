const functions = require("firebase-functions");
const express = require("express");
const app = express();
const admin = require("firebase-admin");
admin.initializeApp();
const profiles = require('./api/profile');
const customer = require('./api/customers');
const employee = require("./api/employees");
const service = require("./admin/services");
app.post("/", async (req, res) => {
    const { id } = req.body;
    // const snapshot = await admin.firestore().collection('users').doc(id).get();
    // return res.json({ id: snapshot.id, ...snapshot.data() });
    admin
        .auth()
        .getUser("n6pxDwzeYqTXZgOW28C525ImKtA3")
        .then((userRecord) => {
            // See the UserRecord reference doc for the contents of userRecord.
            console.log(`Successfully fetched user data: ${userRecord.toJSON()}`);
            res.json({ userRecord });
        })
        .catch((error) => {
            console.log('Error fetching user data:', error);
        });
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

