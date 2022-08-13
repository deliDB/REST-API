'use strict'

const auth = require('basic-auth');
const bcrypt = require('bcrypt');
const { User } = require('../models');

//Middleware to authenticate the request using Basic Authentication
exports.authenticateUser = async(req, res, next) => {
    //Parse user's credentials from the Authorization header
    const credentials = auth(req);
    if(credentials){
        const user = await User.findOne({ where: { emailAddress: credentials.name }});
    }

}