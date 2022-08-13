'use strict';

const express = require('express');
const { User, Course } = require('./models');
const { asyncHandler } = require('./middleware/async-handler');
const { authenticateUser } = require('./middleware/auth-user');

//Router instance
const router = express.Router();

/*********** Users Routes ***********/

// GET /api/users route that returns all properties and values for the currently authenticated User with HTTP status code 200
// WORKING
router.get('/users', authenticateUser, asyncHandler(async(req,res) => {
    const user = req.currentUser;
    
    res.status(200).json({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.emailAddress,
    });
}));

// POST /api/users route that will create a new user, set the Location header to "/", and return HTTP status code 201 with no content
// NOT WORKING, GETTING 400 ERROR, POSTMAN "The request cannot be fulfilled due to bad syntax."
router.post('/users', asyncHandler(async(req, res) => {
    try {
        await User.create(req.body);
        res.status(201).location('/').end(); 
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
// WORKING
router.get('/courses', asyncHandler(async(req,res) => {
    const courses = await Course.findAll({
        attributes: {
            exclude: ['createdAt', 'updatedAt'],
        },
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['firstName', 'lastName', 'emailAddress'],
            },
        ],
    });
    res.status(200).json(courses);
}));

// GET /api/courses/:id route that will return the corresponding course including the User associated with that course and HTTP status code 200
// WORKING
router.get('/courses/:id', asyncHandler(async(req,res) => {
    const course = await Course.findByPk(req.params.id, {
        attributes: {
            exclude: ['createdAt', 'updatedAt'],
        },
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['firstName', 'lastName', 'emailAddress'],
            }
        ]
    });
    if (course){
        res.status(200).json(course);
    } else {
        res.status(404).json({ message: "Course not found" });
    }
}));

// POST /api/courses route that will create a new course, set the Location header to the URI for the newly created course, and return HTTP status code 201 with no content.
// NOT WORKING, GETTING 400 ERROR, POSTMAN "The request cannot be fulfilled due to bad syntax."

router.post('/courses', authenticateUser, asyncHandler(async(req,res) => {
    try{
        const course = await Course.create(req.body);
        res.status(201).location(`/courses/${course.id}`).json({ "message": "Course successfully created." }); //replace with .end() instead of .json() after testing
    } catch(error){
        if(error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError'){
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });
        } else {
            throw error;
        }
    }
}));

// PUT /api/courses/:id route that will update the corresponding course and return a 204 HTTP status code and no content.
//NOT WORKING? Don't see updated text in db, but returns 204 status
router.put('/courses/:id', authenticateUser, asyncHandler(async(req, res) => {
    let course;
    try{
        course = await Course.findByPk(req.params.id);
        if(course){
            await course.update(req.body);
            res.status(204).json({ "message": "Course successfully updated." }); //replace with .end() instead of .json() after testing
        } else {
            res.status(404).json({ message: "Course not found" });
        }
    } catch(error){
        if(error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError'){
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });
        } else {
            throw error;
        }
    }
}));
// DELETE /api/courses/:id route that will delete the corresponding course and return HTTP status code 204 with no content.
//WORKS, deleted course 4
router.delete('/courses/:id', authenticateUser, asyncHandler(async(req,res) => {
    const course = await Course.findByPk(req.params.id);
    if(course){
        await course.destroy();
        res.status(204).json({ "message": "Course successfully deleted. "}); //replace with .end() instead of .json() after testing
    } else {
        res.status(404).json({ message: "Course not found" });
    }
}));

/**
 * Need to add: Update the /api/courses/:id PUT and /api/courses/:id DELETE routes to ensure that the currently authenticated user is the owner of the requested course.
If the currently authenticated user is not the owner of the requested course a 403 HTTP status code should be returned.

 */
module.exports = router;