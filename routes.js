'use strict';

const express = require('express');
const { User, Course } = require('./models');
const { asyncHandler } = require('./middleware/async-handler');
//const { authenticateUser } = require('./middleware/auth-user');

//Router instance
const router = express.Router();

/*********** Users Routes ***********/

// GET /api/users route that returns all properties and values for the currently authenticated User with HTTP status code 200

router.get('/users', asyncHandler(async(req,res) => {
    const user = req.currentUser;
    
    res.status(200).json({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.emailAddress,
    });
}));

// POST /api/users route that will create a new user, set the Location header to "/", and return HTTP status code 201 with no content

router.post('/users', asyncHandler(async(req, res) => {
    try{
        await User.create(req.body);
        res.status(201).location('/').json({ "message": "Account successfully created." }); //replace with .end() instead of .json() after testing
    } catch(error){
        if(error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError'){
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });
        } else {
            throw error;
        }
    }
}));

/*********** Courses Routes ***********/

// GET /api/courses route that returns all courses including the User associated with each course and HTTP status code 200

router.get('/courses', asyncHandler(async(req,res) => {
    const courses = await Course.findAll({
        include: [
            {
                model: User,
                as: 'user',
            },
        ],
    });
    res.status(200).json({ courses });
}));

// GET /api/courses/:id route that will return the corresponding course including the User associated with that course and HTTP status code 200

// POST /api/courses route that will create a new course, set the Location header to the URI for the newly created course, and return HTTP status code 201 with no content.

// DELETE /api/courses/:id route that will delete the corresponding course and return HTTP status code 204 with no content.

module.exports = router;