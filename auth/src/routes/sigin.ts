import express, { Request, Response } from "express";
import { body } from 'express-validator';
import { ValidateRequest } from "../middlewares/validate-request";
import { User } from "../models/user";
import { BadRequestError } from "../errors/bad-request-error";
import { Password } from "../services/password";
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post("/api/users/signin", [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').trim().notEmpty().withMessage('Password required')
], ValidateRequest, async (req: Request, res: Response) => {

    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
        throw new BadRequestError("Invalid credentials");
    }

    const passwordMatch = await Password.compare(existingUser.password, password);

    if (!passwordMatch) {
        throw new BadRequestError("Invalid credentials");
    }

    const userJwt = jwt.sign
        ({
            id: existingUser.id,
            email: existingUser.email
        }, process.env.JWT_KEY!
        );

    req.session = {
        jwt: userJwt
    };

    res.send(existingUser);
});

export { router as signinRouter };