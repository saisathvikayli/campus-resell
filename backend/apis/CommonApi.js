import express from 'express'
import { UserModel } from '../models/UserModel.js'
import { ListingModel } from '../models/ListingModel.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { config } from 'dotenv'
config()

export const commonApp = express.Router()

//register
commonApp.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body

        //check if user already exists
        const existingUser = await UserModel.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered." })
        }

        //hash password
        const hashedPassword = await bcrypt.hash(password, 12)

        //create user
        const newUser = new UserModel({
            name,
            email,
            password: hashedPassword,
            phone: phone || ""
        })

        await newUser.save()
        return res.status(201).json({ message: "Registration successful." })

    } catch (err) {
        return res.status(500).json({ message: "Registration failed.", error: err.message })
    }
})

//login
commonApp.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body

        //check if user exists
        const user = await UserModel.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: "User not found." })
        }

        //check if account is active
        if (!user.isActive) {
            return res.status(403).json({ message: "Account is deactivated." })
        }

        //compare password
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials." })
        }

        //generate token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: "USER" },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )

        //set token in cookie
        res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000
})

        return res.status(200).json({
            message: "Login successful.",
            payload: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar
            }
        })

    } catch (err) {
        return res.status(500).json({ message: "Login failed.", error: err.message })
    }
})

//get all active listings with optional filters
commonApp.get('/listings', async (req, res) => {
    try {
        const { category, condition, minPrice, maxPrice, search } = req.query

        let filter = {
            isSold: false,
            expiresAt: { $gt: new Date() }
        }

        if (category) filter.category = category
        if (condition) filter.condition = condition
        if (minPrice || maxPrice) {
            filter.price = {}
            if (minPrice) filter.price.$gte = Number(minPrice)
            if (maxPrice) filter.price.$lte = Number(maxPrice)
        }
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ]
        }

        const listings = await ListingModel
            .find(filter)
            .populate('seller', 'name avatar')
            .sort({ createdAt: -1 })

        return res.status(200).json({ message: "Listings", payload: listings })

    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch listings.", error: err.message })
    }
})

//get single listing detail
commonApp.get('/listings/:id', async (req, res) => {
    try {
        const listing = await ListingModel
            .findById(req.params.id)
            .populate('seller', 'name avatar phone email')

        if (!listing) {
            return res.status(404).json({ message: "Listing not found." })
        }

        return res.status(200).json({ message: "Listing", payload: listing })

    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch listing.", error: err.message })
    }
})

//get seller public profile and their active listings
commonApp.get('/seller/:id', async (req, res) => {
    try {
        const seller = await UserModel.findById(req.params.id)
            .select('name avatar phone email createdAt')

        if (!seller) {
            return res.status(404).json({ message: "Seller not found." })
        }

        const listings = await ListingModel
            .find({ seller: req.params.id, isSold: false, expiresAt: { $gt: new Date() } })
            .sort({ createdAt: -1 })

        return res.status(200).json({
            message: "Seller Profile",
            payload: { seller, listings }
        })

    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch seller.", error: err.message })
    }
})