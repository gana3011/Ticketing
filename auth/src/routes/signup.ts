import express, { Request, Response } from "express";
import { body } from "express-validator";
import { User } from "../models/user";
import { BadRequestError } from "../errors/bad-request-error";
import jwt from 'jsonwebtoken';
import { ValidateRequest } from "../middlewares/validate-request";

const router = express.Router();

router.post("/api/users/signup", [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').trim().isLength({ min: 4, max: 20 }).withMessage('Password must be between 4 and 20 characters')
], ValidateRequest, async (req: Request, res: Response) => {

    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new BadRequestError('Email in use');
    }
    const user = User.build({ email, password });

    try {
        await user.save();

        const userJwt = jwt.sign({
            id: user.id,
            email: user.email
        }, process.env.JWT_KEY!
        );

        req.session = {
            jwt: userJwt
        };

        res.status(201).send(user);
    }
    catch (err) {
        console.error(err);
    }

});

export { router as signupRouter };