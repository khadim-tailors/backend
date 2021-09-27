const functions = require("firebase-functions");
const express = require("express");
const app = express();
const admin = require("firebase-admin");
admin.initializeApp();
const profiles = require('./profile');
app.post("/", async (req, res) => {
    const { id } = req.body;
    const snapshot = await admin.firestore().collection('users').doc(id).get();
    res.json({ id: snapshot.id, ...snapshot.data() });
});

app.post("/update-user", async (req, res) => {
    const { body } = req;
    const response = await admin.firestore().collection("users").doc(body.id).update(body);
    res.json(response);
});

exports.users = functions.https.onRequest(app);
exports.profile = functions.https.onRequest(profiles);

