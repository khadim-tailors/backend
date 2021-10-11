const express = require("express");
const moment = require("moment");
const dashboard = express.Router();
const admin = require("firebase-admin");
const { sendResponse } = require("../helper/response.helper");
const userRef = admin.firestore().collection("users");
const cors = require("cors");
dashboard.use(cors({ origin: true }))
dashboard.get("/getUsersBasedOnPlans", async (req, res)=>{
    const customers = await userRef.select('plan').get();
    const barChartData = []
    customers
    const obj = {
        Free:0,
        Silver:0,
        Gold:0,
        Platinum:0,
    }
    customers.forEach(doc=>{
        const plan = {...doc.data()};
        obj[plan.plan.name] +=1; 
    })
    Object.keys(obj).forEach(key=>{
        barChartData.push({ label: key, y:obj[key]})
    })
    
    return sendResponse({res, status:true, message:"plans fetched sucessfully,", result: barChartData})
})

dashboard.get('/getAllUsersCreatedDate',async (req, res) =>{
    //get all users in the last year
    try{
        const finalData = []
        const allUser = {
            "Jan":0,
            "Feb":0,
            "Mar":0,
            "Apr":0,
            "May":0,
            "Jun":0,
            "Jul":0,
            "Aug":0,
            "Sep":0,
            "Oct":0,
            "Nov":0,
            "Dec":0,
        }        
        const months = {
            1:"Jan", 
            2:"Feb", 
            3:"Mar", 
            4:"Apr", 
            5:"May", 
            6:"Jun", 
            7:"Jul", 
            8:"Aug", 
            9:"Sep", 
            10:"Oct", 
            11:"Nov", 
            12:"Dec"
        }
        const users = await userRef.get();
        users.forEach(doc=>{
            const data = {...doc.data()};
            const month = Number(moment(data.creationTime).format('MM'));
            console.log(month)
            allUser[months[month]] += 1;
        })
        Object.keys(allUser).forEach(key=>{
            finalData.push({y:allUser[key], label:key})
        })
        sendResponse({ res,message:"Success", status:true, result:finalData})
    }catch(e){
        sendResponse({res, status:false, message:e.message ? e.message : "Something went wrong", result:[]})
    }
})

dashboard.get("/getNumberOfTailors", async (req,res)=>{
    try {
        let customerCountThisMonth = 0;
        let customerCountLastMonth = 1;
        const allCustomers = []
        const customers = await userRef.get();
        customers.forEach(doc=>{
            const data = {...doc.data()};
            if(Number(moment(data.creationTime).format('MM')) == Number(moment().format('MM'))) customerCountThisMonth+=1;
            if(Number(moment(data.creationTime).format('MM')) == Number(moment().format('MM'))-1) customerCountLastMonth+=1;
            const percentageGrowth = (customerCountThisMonth - customerCountLastMonth)/customerCountLastMonth*100;
            sendResponse({res, message:"Success", status:true, result:{customerCountThisMonth, customerCountLastMonth, percentageGrowth}})

        })
    } catch (error) {
        
    }
})

module.exports = dashboard;