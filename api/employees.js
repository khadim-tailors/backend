const express = require("express");
const employees = express.Router();
const admin = require("firebase-admin");
const { sendResponse } = require("../helper/response.helper");
const employeeRef = admin.firestore().collection("employees");
const bcrypt = require('bcrypt');
const { getUserWithUserId, getEmployeeByUsername } = require("../helper/helper");
const saltRounds = 2;
employees.post("/getAllEmployees", async (req, res) => {
    const { user_id } = req.body;
    try {
        const Allemployees = [];
        const empList = await employeeRef.where("user_id", "==", user_id).get();
        empList.forEach(doc => {
            const emp = {
                employee_id: doc.id,
                ...doc.data()
            };
            delete emp.password;
            Allemployees.push(emp);
        });
        sendResponse({ res, message: "Employees fetched successfully!", status: true, result: Allemployees });
    } catch (err) {
        sendResponse({ res, message: err.message ? err.message : "Employees fetched failed!", status: false, result: [] });
    }
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

employees.post("/employeeLogin", async (req, res) => {
    const { username, password } = req.body;
    if (username && password) {
        try {
            const employeeData = await getEmployeeByUsername(username);
            if (employeeData) {
                const hashedPassword = employeeData.password;
                delete employeeData.password;
                bcrypt.compare(password, hashedPassword, async (err, result) => {
                    // result == true then the password is matched
                    if (result) {
                        console.log(employeeData.user_id);
                        const orgData = await getUserWithUserId(employeeData.user_id);
                        if (orgData) return sendResponse({
                            res,
                            message: "Logged in successful!",
                            status: true,
                            result: { ...employeeData, organization_name: orgData.first_name + " " + orgData.last_name }
                        });
                        else return sendResponse({ res, message: "Organisation not found", status: false, result: [] });
                    } else return sendResponse({
                        res,
                        message: "You have entered wrong password, if you forget your password contact your admin to change it.",
                        status: false,
                        result: []
                    });
                });
            } else return sendResponse({ res, message: "username does not exist, make sure to pass correct username", status: false, result: [] });
        } catch (error) {

        }
    } else return sendResponse({ res, message: "username and password is required!", status: false, result: [] });
});

employees.post("/changeEmployeePassword", async (req, res) => {
    const { username, old_password, new_password, user_id } = req.body;
    if (username && old_password && new_password && user_id) {
        const employeeData = await getEmployeeByUsername(username);
        if (employeeData) {
            //if username in the employee details and the one which is send in the request is not same then
            // the employee is not belongs to the organization
            if (employeeData.user_id !== user_id) return sendResponse({
                res,
                message: "Employee does not belongs to you. You can only change your employee data.",
                status: false,
                result: []
            });
            bcrypt.compare(old_password, employeeData.password, async (err, result) => {
                // result == true password matches
                if (result) {
                    bcrypt.genSalt(saltRounds, async (err, salt) => {
                        bcrypt.hash(new_password, salt, (err, hash) => {
                            if (err) return sendResponse({ res, message: err.message ? err.message : "password encryption failed", status: false, result: [] });
                            employeeRef.doc(username).update({ password: hash }).then(response => {
                                return sendResponse({ res, message: "password updated successfully", result: [], status: true });
                            }).catch(err => {
                                return sendResponse({ res, message: err.message ? err.message : "Something went wrong while writing in the database.", status: false, result: [] });
                            });
                        });
                    });
                }
            });
        } else return sendResponse({ res, status: false, message: "employee not found, make sure you pass the correct username", result: [] });
    } else return sendResponse({ res, message: "username, old password, new password and user_id is mandatory", status: false, result: [] });
});

employees.post("/updateEmployee", async (req, res) => {
    const data = req.body;
    const { username, user_id } = data;
    if (username && user_id) {
        const employeeData = await getEmployeeByUsername(username);
        if (employeeData) {
            //if username in the employee details and the one which is send in the request is not same then
            // the employee is not belongs to the organization
            if (employeeData.user_id !== user_id) return sendResponse({
                res,
                message: "Employee does not belongs to you. You can only change your employee data.",
                status: false,
                result: []
            });
            const emp = await employeeRef.doc(username).update(data);
            return sendResponse({ res, message: "Employee updated successfully.", result: emp, status: true });
        } else return sendResponse({ res, status: false, message: "employee not found, make sure you pass the correct username", result: [] });
    } else return sendResponse({ res, message: "username and user_id is mandatory", status: false, result: [] });
});

employees.post("/deactivateEmployee", async (req, res) => {
    const data = req.body;
    const { username, user_id } = data;
    if (username && user_id) {
        const employeeData = await getEmployeeByUsername(username);
        if (employeeData) {
            //if username in the employee details and the one which is send in the request is not same then
            // the employee is not belongs to the organization
            if (employeeData.user_id !== user_id) return sendResponse({
                res,
                message: "Employee does not belongs to you. You can only change your employee data.",
                status: false,
                result: []
            });
            const emp = await employeeRef.doc(username).update({ status: false });
            return sendResponse({ res, message: "Employee deactivated successfully.", result: emp, status: true });
        } else return sendResponse({ res, status: false, message: "employee not found, make sure you pass the correct username", result: [] });
    } else return sendResponse({ res, message: "username and user_id is mandatory", status: false, result: [] });
});

module.exports = employees;