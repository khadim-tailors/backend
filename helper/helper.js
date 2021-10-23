const admin = require("firebase-admin");
const userRef = admin.firestore().collection("users");
const employeeRef = admin.firestore().collection("employees");

module.exports.getUserWithUserId = async (user_id) => {
    const user = await userRef.doc(user_id).get();
    if (user.exists) return { user_id: user.id, ...user.data() };
    return false;
};

module.exports.getEmployeeByUsername = async (username) => {
    const employee = await employeeRef.doc(username).get();
    if (employee.exists) return { employee_id: employee.id, ...employee.data() };
    else return false;
};

module.exports.isUserIdValid = async (user_id) => {
    if (!user_id) return false;
    const userSnapshot = await userRef.doc(user_id).get();
    return userSnapshot.exists;

};