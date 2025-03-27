const jwt = require('jsonwebtoken');
const { signupSchema, loginSchema, acceptcodeSchema, changePasswordSchema, acceptedFPSchema } = require("../middlewares/validator");
const User = require('../models/userModel');
const { doHash, doHashValidation, hmacProcess } = require("../utils/hashPassword");
const transport = require('../middlewares/sendEmail');

exports.signup = async (req, res) => {
    const { email, password, name } = req.body;
    try {
        const { error, value } = signupSchema.validate({ email, password, name })

        if (error) {
            return res.status(403).json({ success: false, message: error.details[0].message })
        }

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(409).json({ success: false, message: "User already exists. Please use another email." })
        }

        const hashedPassword = await doHash(password, 12)

        const newUser = new User({
            email,
            password: hashedPassword,
            name,
            verified: false,
        })
        const result = await newUser.save()
        result.password = undefined;
        const token = jwt.sign(
            {
                userId: result.id,
                email: result.email,
                verified: result.verified
            },
            process.env.TOKEN_SECRET,
            { expiresIn: '12h' }
        );

        res.cookie('Authorization', 'Bearer ' + token, {
            expires: new Date(Date.now() + 8 * 3600000),
            httpOnly: process.env.NODE_ENV === 'production',
            secure: process.env.NODE_ENV === 'production'
        });

        res.status(201).json({
            success: true,
            message: "You are signup successfully",
            token,
            result
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
}

exports.login = async (req, res) => {
    const { email, password } = req.body
    try {
        const { error, value } = loginSchema.validate({ email, password })

        if (error) {
            return res.status(403).json({ success: false, message: error.details[0].message })
        }

        const existingUser = await User.findOne({ email }).select('+password')
        console.log("user", existingUser)
        if (!existingUser) {
            return res.status(403).json({ success: false, message: "User does not exists" })
        }

        const result = await doHashValidation(password, existingUser.password)
        if (!result) {
            return res.status(403).json({ success: false, message: "Invalid credentials" })
        }

        const token = jwt.sign({
            userId: existingUser.id,
            email: existingUser.email,
            verified: existingUser.verified
        }, process.env.TOKEN_SECRET, {
            expiresIn: '12h'
        });

        const userData = {
            email: existingUser.email,
            name: existingUser.name,
            _id: existingUser._id,
            verified: existingUser.verified,
            createdAt: existingUser.createdAt,
            updatedAt: existingUser.updatedAt,
            __v: existingUser.__v
        };

        res.cookie('Authorization', 'Bearer' + token, {
            expires: new Date(Date.now() + 8 * 3600000),
            httpOnly: process.env.NODE_ENV === 'production', secure: process.env.NODE_ENV === 'production'
        }).json({
            success: true,
            token,
            message: "logged in successfully.",
            result: userData
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
}

exports.logout = async (req, res) => {
    res.clearCookie('Authorization').status(200).json({ success: true, message: "logout successfully" })
}

exports.sendForgotPasswordCode = async (req, res) => {
    console.log("Request body:", req.body);
    const { email } = req.body;
    console.log(email)
    try {
        const existingUser = await User.findOne({ email })
        if (!existingUser) {
            return res.status(404).json({ success: false, message: "User does not exists" })
        }
        if (existingUser.verified) {
            return res.status(400).json({ success: true, message: "User already verified" })
        }

        const codeValue = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
        let info = await transport.sendMail({
            from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to: existingUser.email,
            subject: "Verification Code",
            html: "<h1>" + codeValue + "</h1>"
        })

        if (info.accepted[0] === existingUser.email) {
            const hashedCodevalue = hmacProcess(codeValue,process.env.HMAC_VERIFICATION_CODE)
            existingUser.forgetPasswordCode = hashedCodevalue;
            existingUser.forgetPasswordValidation = Date.now();
            await existingUser.save();
            return res.status(200).json({success: true, message: "Code sent successfully", email: existingUser.email,})
        }
        res.status(400).json({success:false, message:'code sent failed'})
    } catch (error) {
        console.log(error)
    }
}

exports.verifyForgotPasswordCode = async (req, res) => {
    const {email, providedCode, newPassword} = req.body
    try {
        const { error, value } = acceptedFPSchema.validate({ email, providedCode, newPassword })

        if (error) {
            return res.status(403).json({ success: false, message: error.details[0].message })
        }
        const codeValue = providedCode.toString();
        const existingUser = await User.findOne({email}).select('+forgetPasswordCode +forgetPasswordValidation')
        if (!existingUser) {
            return res.status(404).json({ success: false, message: "User does not exists" })
        }
       
        if(!existingUser.forgetPasswordCode || !existingUser.forgetPasswordValidation){
            return res.status(400).json({ success: false, message: "Invalid verification request" })
        }
        if(Date.now() - existingUser.forgetPasswordCode > 5*60*1000){
            return res.status(400).json({success: false, message:"code has been expired!"})
        }
        const hashedCodevalue = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE)
       
        if (hashedCodevalue === existingUser.forgetPasswordCode) {
            const hashedPassword = await doHash(newPassword, 12)
            existingUser.password = hashedPassword;
            existingUser.forgetPasswordCode = undefined;
            existingUser.forgetPasswordValidation = undefined;
            await existingUser.save();
            return res.status(200).json({
                success: true,
                message: "password updated!"
            });
        }

    }catch(error) {
        console.log(error)
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

