const express = require("express");
const customer = express.Router();
const admin = require("firebase-admin");
const { sendResponse } = require("../helper/response.helper");
const customerRef = admin.firestore().collection('customer');

customer.post('/getAllCustomers', async (req, res) => {
    const data = req.body;
    const { user_id } = data;
    const allCustomers = [];
    try {
        const customers = await customerRef.where("user_id", '==', user_id).get();
        customers.forEach(doc => {
            allCustomers.push({ customer_id: doc.id, ...doc.data() });
        });
        sendResponse({ res, message: "Customers fetched successfully!", status: true, result: allCustomers });
    } catch (error) {
        sendResponse({ res, message: "Failed to fetch customers!", status: false, result: [] });

    }
});

customer.post('/addNewCustomer', async (req, res) => {
    const data = req.body;
    const { user_id, email, phone } = data;
    if (user_id && email && phone) {
        try {
            const allCustomers = [];
            let query = customerRef;
            query = query.where("user_id", "==", user_id);
            query = query.where("email", "==", email);
            query = query.where("phone", "==", phone);
            const customers = await query.get();
            customers.forEach((doc => {
                allCustomers.push({ customer_id: doc.id, ...doc.data() });
            }));
            if (allCustomers.length > 0) {
                sendResponse({ res, message: "Customer already exist. Try searching it using mobile number or email", status: false, result: [] });
            } else {
                const newCustomer = await customerRef.add(data);
                sendResponse({ status: true, message: "Customer added successfully", res, result: newCustomer });
            }
            return res.json(allCustomers);
        } catch (error) {
            sendResponse({ res, status: false, message: "Failed to add new customer", result: [] });
        }
    } else {
        sendResponse({ res, message: "user_id, email and phone number is Mandatory!", status: false, result: [] });
    }
});

customer.post("/updateCustomer", async (req, res) => {
    const data = req.body;
    const { user_id, customer_id } = data;
    const allCustomers = [];
    const doc = await customerRef.doc(customer_id).get();
    const customer = { customer_id: doc.id, ...doc.data() };

    console.log(customer);
    if (!customer) {
        sendResponse({ res, message: "Customer not found. Make sure you pass correct customer_id", status: false, result: [] });
    } else {
        const allMeasurementsToBeUpdated = [];
        const existingImages = customer.images;
        const existingMeasurements = customer.measurements;
        const incomingMeasurements = data.measurements;
        const collectionName = data.measurement_for;
        const incomingImages = data.images;
        incomingMeasurements.forEach(incomingMeasure => {
            const index = existingMeasurements.findIndex(existingMeasure => existingMeasure.name === incomingMeasure.name);
            if (index !== -1) existingMeasurements.splice(index, 1);
        });
        // if (incomingMeasurements && incomingMeasurements.length > 0) {
        //     const updatedMeasurements = [];
        //     incomingMeasurements.forEach(measurement => {
        //         const oldMeasurement = existingMeasurements.find(existingMeasure => existingMeasure.name === measurement.name);
        //         if (oldMeasurement) {
        //             //take the incoming one (User updated existing one)
        //             allMeasurementsToBeUpdated.push(measurement)
        //         } else {
        //             //user added new measurement
        //             allMeasurementsToBeUpdated.push(measurement)
        //         }
        //     });
        //     const newCustomer = await customerRef.doc(customer_id).set(data, { merge: true });
        //     sendResponse({ status: true, message: "Customer updated successfully", res, result: newCustomer });
        // }
    }

});

module.exports = customer;