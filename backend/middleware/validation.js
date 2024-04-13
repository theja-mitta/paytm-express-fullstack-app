const zod = require('zod');

const {User} = require('../db');

const signupBody = zod.object({
    username: zod.string().email(),
    password: zod.string(),
    firstName: zod.string(),
    lastName: zod.string(),
});

const siginBody = zod.object({
    username: zod.string().email(),
    password: zod.string(),
});

const updateUserSchema = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
});

async function validateSignup(req, res, next) {
    const validationResult = signupBody.safeParse(req.body);
    if (!validationResult.success) {
        res.status(400).json({
            message: 'Incorrect inputs', errors: validationResult.console.error.errors
        })
    }
    const {username} = validationResult.data;

    // Check if username already exists
    try {
        const existingUser = await User.findOne({username});
        if (existingUser) {
            res.status(411).json({
                message: "Email already taken"
            })
        }
    } catch(error) {
        res.status(500).json({
            message: "Internal server error"
        })
    }

    req.validatedData = validationResult.data;
    next();
}

async function validateSignin(req, res, next) {
    const validationResult = siginBody.safeParse(req.body);

    if (!validationResult) {
        res.status(411).json({
            message: 'Incorrect inputs', errors: validationResult.console.error.errors
        })
    }

    next();
}

async function validateUpdatedUserDetails(req, res, next) {
    const validationResult = updateUserSchema.safeParse(req.body);

    if (!validationResult) {
        res.status(411).json({
            message: 'Incorrect inputs', errors: validationResult.console.error.errors
        })
    }

    next();
}

module.exports = {validateSignup, validateSignin, validateUpdatedUserDetails};