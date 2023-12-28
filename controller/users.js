const Joi = require('joi');
const { errorResponse, successResponse, catchBlockErrorResponse } = require('../helpers/response');
const mongoose = require('mongoose');
const userModel = mongoose.model('users');
const { getPagination, getTotalCountQuery, searchDataArr } = require('../helpers/queryHelper');
const { createJWTToken } = require('../helpers/JWTToken');

//Add User:
exports.addUser = async (req, res) => {
    try {
        const validationSchema = Joi.object({
            name: Joi.string().required(),
            email: Joi.string().required(),
            phone: Joi.string().required(),
            address: Joi.string().required()
        });
        const { error, value } = validationSchema.validate(req.body);
        if (error) {
            return errorResponse(res, 400, error.details[0].message);
        }

        let userData = new userModel({
            name: value.name,
            email: value.email,
            phone: value.phone,
            address: value.address,
            createdBy: req.user._id, //Get the _id from JWT token
            updatedBy: req.user._id  //Get the _id from JWT token
        })
        await userData.save()
        return successResponse(res, 200, "Data save sucessfully!", userData);
    } catch (error) {
        return catchBlockErrorResponse(res, error.message);
    }
}


//Get Users:
exports.getUser = async (req, res) => {
    try {
        const validationSchema = Joi.object({
            limit: Joi.number().integer().min(0).default(10),
            pageNo: Joi.number().integer().min(1).default(1),
            search: Joi.string().allow('').optional(),
            sort: Joi.string().default("_id"),
            sortBy: Joi.string().default("desc"),
        });

        const { error, value } = validationSchema.validate(req.body);
        if (error) {
            return errorResponse(res, 400, error.details[0].message);
        }

        const pagination = getPagination({
            pageLimit: value.limit,
            pageNum: value.pageNo,
            sort: value.sort,
            sortBy: value.sortBy
        });

        let matchQuery = { isDeleted: false };
        if (value.search) {
            matchQuery = { ...matchQuery, ...searchDataArr(['name','email'], value.search) };
        }

        const mainQuery = [{ $match: matchQuery }];
        const totalCountQuery = getTotalCountQuery(mainQuery);
        const totalCountResult = await userModel.aggregate(totalCountQuery);
        const totalCount = totalCountResult[0] ? totalCountResult[0].count : 0;

        const userData = await userModel
            .find(matchQuery).populate("createdBy","name")
            .limit(pagination.limit)
            .skip(pagination.skip)
            .sort(pagination.sort);

        const metaData = {
            total: totalCount,
            limit: pagination.limit,
            pageNo: pagination.page,
            totalPages: pagination.limit > 0 ? Math.ceil(totalCount / pagination.limit) : 1,
            currentPage: pagination.page
        };

        return successResponse(res, 200, "Data fetched successfully!", userData, metaData);
    } catch (error) {
        return catchBlockErrorResponse(res, error.message);
    }
};



//Update User:
exports.updateUser = async (req, res) => {
    try {
        const validationSchema = Joi.object({
            userID: Joi.string().required(),
            name: Joi.string(),
            email: Joi.string(),
            phone: Joi.string(),
            address: Joi.string()
        });
        const { error, value } = validationSchema.validate(req.body);
        if (error) {
            return errorResponse(res, 400, error.details[0].message);
        }

        const updatedUserData = await userModel.findByIdAndUpdate(
            value.userID,
            {
                name: value.name,
                email: value.email,
                phone: value.phone,
                address: value.address,
                updatedBy: req.user._id // assuming you have user id in req.user form JWT token
            },
            { new: true }
        );

        if (!updatedUserData) {
            return errorResponse(res, 404, "User not found");
        }

        return successResponse(res, 200, "Data updated successfully!", updatedUserData);
    } catch (error) {
        return catchBlockErrorResponse(res, error.message);
    }
};

//Soft Delete User:
exports.deleteUser = async (req, res) => {
    try {    
        const validationSchema = Joi.object({
            userID: Joi.string().required()
        });
        const { error, value } = validationSchema.validate(req.body);
        if (error) {
            return errorResponse(res, 400, error.details[0].message);
        }

        const userData = await userModel.findByIdAndUpdate(
            value.userID,
            {
                isDeleted: true,
                deletedBy: req.user._id // assuming you have user id in req.user
            },
            { new: true }
        );

        if (!userData) {
            return errorResponse(res, 404, "User not found");
        }

        return successResponse(res, 200, "User deleted successfully!", userData);
    } catch (error) {
        return catchBlockErrorResponse(res, error.message);
    }
};