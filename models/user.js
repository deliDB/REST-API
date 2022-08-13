'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class User extends Model {}
    User.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        firstName: {
            type: DataTypes.STRING,
        },
        lastName: {
            type: DataTypes.STRING,
        },
        emailAddress: {
            type: DataTypes.STRING,
        },
        password: {
            type: DataTypes.STRING,
        },
    }, { sequelize });

    //Adds associations
   User.associate = (models) => { 
        User.hasMany(models.Course, {
            as: 'user',
            foreignKey: {
                fieldName: 'userID',
            },
        });
    };
    
    return User;
};