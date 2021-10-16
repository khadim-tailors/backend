const express = require("express");
const customer = express.Router();
const admin = require("firebase-admin");
const { sendResponse } = require("../helper/response.helper");
const customerRef = admin.firestore().collection('customers');
const cors = require("cors");
customer.use(cors({ origin: true }));

async function getSubcollectionData(subcollectionName, docId) {
    const allMeasurements = [];
    const meaurements = await customerRef.doc(docId).collection(subcollectionName).get();
    meaurements.forEach(measurement => {
        allMeasurements.push({ measurement_for: measurement.id, ...measurement.data() });
        console.log(allMeasurements);
    });
    return allMeasurements;
}
customer.post('/getAllCustomers', async (req, res) => {
    const data = req.body;
    const { user_id } = data;
    const allCustomers = [];
    try {
        const customers = await customerRef.where("user_id", '==', user_id).get();
        customers.forEach(doc => {
            allCustomers.push({ customer_id: doc.id, ...doc.data(), collections: doc.collections });
        });
        for (let i = 0; i < allCustomers.length; i++) {
            const allMeasurements = await getSubcollectionData('measurements', allCustomers[i].customer_id);
            allCustomers[i].measurements = allMeasurements;
        }
        return sendResponse({ res, message: "Customers fetched successfully!", status: true, result: allCustomers });
    } catch (error) {
        sendResponse({ res, message: error.message ? error.message : "Failed to fetch customers!", status: false, result: [] });

    }
});

customer.post('/addNewCustomer', async (req, res) => {
    const data = req.body;
    const { user_id, email, phone, measurements, measurement_for } = data;
    if (user_id && email && phone) {
        try {
            const allCustomers = [];
            let query = customerRef;
            //checking if the customer is already exist
            query = query.where("user_id", "==", user_id);
            query = query.where("email", "==", email);
            query = query.where("phone", "==", phone);
            const customers = await query.get();
            customers.forEach((doc => {
                allCustomers.push({ customer_id: doc.id, ...doc.data() });
            }));
            // if customer already exist then returning error
            if (allCustomers.length > 0) {
                return sendResponse({ res, message: "Customer already exist. Try searching it using mobile number or email", status: false, result: [] });
            } else {
                if (data.measurements) delete data.measurements;
                if (data.measurement_for) delete data.measurement_for;
                const newCustomer = await customerRef.add(data);
                console.log(newCustomer.id);
                const measurementForCust = await customerRef.doc(newCustomer.id).collection("measurements").doc(measurement_for).set({ measurements: measurements });
                return sendResponse({ status: true, message: "Customer added successfully", res, result: newCustomer });
            }
        } catch (error) {
            sendResponse({ res, status: false, message: error.message ? error.message : "Failed to add new customer", result: [] });
        }
    } else {
        sendResponse({ res, message: "user_id, email and phone number is Mandatory!", status: false, result: [] });
    }
});

customer.post("/updateCustomer", async (req, res) => {
    const data = req.body;
    const { user_id, customer_id } = data;
    const doc = await customerRef.doc(customer_id).get();
    const customer = { customer_id: doc.id, ...doc.data() };
    if (!customer) sendResponse({ res, message: "Customer not found. Make sure you pass correct customer_id", status: false, result: [] });
    if (customer.user_id !== user_id) return sendResponse({ res, message: "You cannot modify this customer because it does not belong to you.", status: false, result: [] });
    if (data.meaurements && data.measurements.length > 0 && data.measurements_for) {
        const allMeasurementsToBeUpdated = [];
        const existingMeasurements = customer.measurements;
        const incomingMeasurements = data.measurements;
        const { measurements_for } = data;
        // removing existing measurements 
        incomingMeasurements.forEach(incomingMeasure => {
            const index = existingMeasurements.findIndex(existingMeasure => existingMeasure.name === incomingMeasure.name);
            if (index !== -1) existingMeasurements.splice(index, 1);
        });
        // merging existing and incoming (updated) measurements.
        allMeasurementsToBeUpdated = [...existingMeasurements, ...incomingMeasurements];
        try {
            const measurements = await customerRef
                .doc(customer_id)
                .collection("measurements")
                .doc(measurements_for)
                .update(allMeasurementsToBeUpdated);
        } catch (error) {
            console.log("Error while updating the measurements", error.message);
        }
    }
    if (data.images && data.images.length > 0) {
        const existingImages = customer.images;
        const incomingImages = data.images;
        incomingImages.forEach(incomingImage => {
            const index = existingImages.findIndex(existingImage => existingImage.name === incomingImage.name);
            existingImages.splice(index, 1);
        });
        data.images = [...existingImages, ...incomingImages];
    }
    try {
        const updatedValues = await customerRef.doc(customer_id).update(data);
        return sendResponse({ res, message: "Customer updated successfully.", status: true, result: updatedValues.id });
    } catch (error) {
        return sendResponse({ res, message: error.message ? error.message : "Customer update failed.", status: false, result: [] });
    }
});


module.exports = customer;