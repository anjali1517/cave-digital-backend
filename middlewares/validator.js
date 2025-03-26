const joi = require('joi');

exports.signupSchema = joi.object({
    email: joi.string().min(6).max(60).required().email({
        tlds: {allow: ['com','net']}
    }),
    password: joi.string().min(6).required(),
    name: joi.string().required()
});

exports.loginSchema = joi.object({
    email: joi.string().min(6).max(60).required().email({
        tlds: {allow: ['com','net']}
    }),
    password: joi.string().min(6).required()
});

exports.acceptcodeSchema = joi.object({
    email: joi.string().min(6).max(60).required().email({
        tlds: {allow: ['com','net']}
    }),
    providedCode: joi.number().required()
});

exports.changePasswordSchema = joi.object({
    newPassword: joi.string().min(6).required(),
});

exports.acceptedFPSchema = joi.object({
    email: joi.string().min(6).max(60).required().email({
        tlds: {allow: ['com','net']}
    }),
    providedCode: joi.number().required(),
    newPassword: joi.string().min(6).required(),
});

exports.createTaskSchema = joi.object({
    title: joi.string().min(3).max(60).required(),
    description: joi.string().min(3).max(600).required(),
    userId: joi.string().required()
})