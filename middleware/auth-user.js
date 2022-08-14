'use strict'

const auth = require('basic-auth');
const bcrypt = require('bcrypt');
const { User } = require('../models');

//Middleware to authenticate the request using Basic Authentication
exports.authenticateUser = async(req, res, next) => {
    let message;
    //Parse user's credentials from the Authorization header, attempt to retrieve user from data store by key if user's credentials are available.
    const credentials = auth(req);
    if(credentials){
        const user = await User.findOne({ where: { emailAddress: credentials.name }});
        //Compare user's psw from Authorization header to user's psw retrieved from data store.
        if(user){
            const authenticated = bcrypt.compareSync(credentials.pass, user.password)
            //If psws match store retrieved user object on the request object
            if(authenticated){
                req.currentUser = user;
            } else {
                message = `Authentication failure for email address: ${user.emailAddress}`;
            }
        } else {
            message = `User not found for email address: ${credentials.name}`;
        }
    } else {
        message = 'Authorization header not found';
    }

    if(message){
        console.warn(message);
        res.status(401).json({ message: 'Access Denied' });
    } else {
        next();
    }
};
/**
 * Source code: REST API Authentication with Express module
 * https://teamtreehouse.com/library/rest-api-authentication-with-express-2
 */