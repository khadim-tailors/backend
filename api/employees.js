const express = require("express");
const employees = express.Router();
const admin = require("firebase-admin");
const { sendResponse } = require("../helper/response.helper");
const employeeRef = admin.firestore().collection("employees");
const bcrypt = require('bcrypt');
const saltRounds = 2;
employees.post("/getAllEmployees", async (req, res) => {
    const { };
});

async function isUsernameAlreadyExist(username) {
    try {
        const snapshot = await employeeRef.doc(username).get();
        console.log("doc.exists", snapshot.exists);
        if (snapshot.exists) return true;
        return false;
    } catch (error) {
        return false;
    }
}


async function isEmployeeAlreadyExist(phone) {
    const allEmployees = [];
    const employee = await employeeRef.where("phone", "==", phone).get();
    employee.forEach(doc => allEmployees.push(doc.id));
    if (allEmployees.length > 0) return true;
    return false;
}
employees.post("/addNewEmployee", async (req, res) => {
    const data = req.body;
    const { user_id, username, password, phone } = data;
    if (await isUsernameAlreadyExist(username))
        return sendResponse({ res, message: "Username is already taken, kindly choose a different username.", status: false, result: [] });
    if (await isEmployeeAlreadyExist(phone))
        return sendResponse({ res, message: "Employee already exist.", status: false, result: [] });
    if (user_id && username && password && phone) {
        bcrypt.genSalt(saltRounds, async (err, salt) => {
            bcrypt.hash(password, salt, (err, hash) => {
                // Store hash in your password DB.
                console.log("error while hashing", err);
                console.log("hashed", hash);
                if (err)
                    return sendResponse({ res, status: false, message: "Cannot create employee, try creating employee with different username and password", result: [] });
                employeeRef.doc(username).set({ ...data, password: hash }).then(response => {
                    return sendResponse({ res, message: "Employee created successfully.", status: true, result: [] });
                }).catch(err => {
                    return sendResponse({ res, message: err.message ? err.message : "An unknown error occured", result: [], status: false });
                });
            });
        });
    } else {
        return sendResponse({ res, message: "username, password, user_id and phone number cannot be empty", status: false, result: [] });
    }

});

employees.post("");
module.exports = employees;