import express from 'express'
import { UserModel } from '../models/UserModel.js'
import { ListingModel } from '../models/ListingModel.js'
import { verifyToken } from '../middleware/verifytok.js'
import upload from '../config/cloudinaryUpload.js'
import { WatchModel } from '../models/WatchModel.js'
import { NotificationModel } from '../models/NotificationModel.js'

export const userApp = express.Router()

//get my profile
userApp.get('/profile', verifyToken("USER"), async (req, res) => {
    try {
        const user = await UserModel.findById(req.user.id).select('-password')
        if (!user) {
            return res.status(404).json({ message: "User not found." })
        }
        return res.status(200).json({ message: "Profile", payload: user })

    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch profile.", error: err.message })
    }
})

//update my profile
userApp.put('/profile', verifyToken("USER"), upload.single('avatar'), async (req, res) => {
    try {
        const { name, phone } = req.body

        const updateData = {}
        if (name) updateData.name = name
        if (phone) updateData.phone = phone
        if (req.file) updateData.avatar = req.file.path

        const updatedUser = await UserModel.findByIdAndUpdate(
            req.user.id,
            { $set: updateData },
            { new: true }
        ).select('-password')

        return res.status(200).json({ message: "Profile updated.", payload: updatedUser })

    } catch (err) {
        return res.status(500).json({ message: "Failed to update profile.", error: err.message })
    }
})

//logout
userApp.post('/logout', verifyToken("USER"), (req, res) => {
    res.clearCookie('token')
    return res.status(200).json({ message: "Logged out successfully." })
})

//create a listing
userApp.post('/listings', verifyToken("USER"), upload.array('images', 4), async (req, res) => {
    try {
        const { title, description, price, category, condition } = req.body

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "At least one image is required." })
        }

        const images = req.files.map(file => file.path)

        const newListing = new ListingModel({
            title,
            description,
            price,
            category,
            condition,
            images,
            seller: req.user.id
        })

        await newListing.save()
        return res.status(201).json({ message: "Listing created.", payload: newListing })

    } catch (err) {
        return res.status(500).json({ message: "Failed to create listing.", error: err.message })
    }
})

//get my listings
userApp.get('/listings', verifyToken("USER"), async (req, res) => {
    try {
        const { status } = req.query
        let filter = { seller: req.user.id }

        if (status === 'active') {
            filter.isSold = false
            filter.expiresAt = { $gt: new Date() }
        } else if (status === 'sold') {
            filter.isSold = true
        } else if (status === 'expired') {
            filter.isSold = false
            filter.expiresAt = { $lte: new Date() }
        }

        const listings = await ListingModel.find(filter).sort({ createdAt: -1 })
        return res.status(200).json({ message: "My Listings", payload: listings })

    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch listings.", error: err.message })
    }
})

//edit a listing
userApp.put('/listings/:id', verifyToken("USER"), upload.array('images', 4), async (req, res) => {
    try {
        const listing = await ListingModel.findById(req.params.id)

        if (!listing) {
            return res.status(404).json({ message: "Listing not found." })
        }

        if (listing.seller.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized." })
        }

        const { title, description, price, category, condition, existingImages } = req.body

        //remember old price before updating
        const oldPrice = listing.price

        const updateData = {}
        if (title) updateData.title = title
        if (description) updateData.description = description
        if (price) updateData.price = price
        if (category) updateData.category = category
        if (condition) updateData.condition = condition

        const kept = existingImages
            ? Array.isArray(existingImages) ? existingImages : [existingImages]
            : []
        const newUploads = req.files ? req.files.map(f => f.path) : []
        updateData.images = [...kept, ...newUploads]

        const updatedListing = await ListingModel.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        )

        //if price dropped, notify all watchers
        if (price && Number(price) < oldPrice) {
            const watchers = await WatchModel.find({ listing: req.params.id })

            const drop = oldPrice - Number(price)
            const notifications = watchers.map(w => ({
                user: w.user,
                listing: req.params.id,
                message: `Price dropped by Rs.${drop} on "${updatedListing.title}" — now Rs.${price}`
            }))

            if (notifications.length > 0) {
                await NotificationModel.insertMany(notifications)
            }
        }

        return res.status(200).json({ message: "Listing updated.", payload: updatedListing })

    } catch (err) {
        return res.status(500).json({ message: "Failed to update listing.", error: err.message })
    }
})

//mark listing as sold
userApp.put('/listings/:id/sold', verifyToken("USER"), async (req, res) => {
    try {
        const listing = await ListingModel.findById(req.params.id)

        if (!listing) {
            return res.status(404).json({ message: "Listing not found." })
        }

        //check ownership
        if (listing.seller.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized." })
        }

        listing.isSold = true
        await listing.save()

        return res.status(200).json({ message: "Listing marked as sold.", payload: listing })

    } catch (err) {
        return res.status(500).json({ message: "Failed to update listing.", error: err.message })
    }
})

//delete a listing
userApp.delete('/listings/:id', verifyToken("USER"), async (req, res) => {
    try {
        const listing = await ListingModel.findById(req.params.id)

        if (!listing) {
            return res.status(404).json({ message: "Listing not found." })
        }

        //check ownership
        if (listing.seller.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized." })
        }

        await ListingModel.findByIdAndDelete(req.params.id)
        return res.status(200).json({ message: "Listing deleted." })

    } catch (err) {
        return res.status(500).json({ message: "Failed to delete listing.", error: err.message })
    }
})

//renew listing expiry by 30 days
userApp.put('/listings/:id/renew', verifyToken("USER"), async (req, res) => {
    try {
        const listing = await ListingModel.findById(req.params.id)

        if (!listing) {
            return res.status(404).json({ message: "Listing not found." })
        }

        //check ownership
        if (listing.seller.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized." })
        }

        listing.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        await listing.save()

        return res.status(200).json({ message: "Listing renewed.", payload: listing })

    } catch (err) {
        return res.status(500).json({ message: "Failed to renew listing.", error: err.message })
    }
})

//watch a listing
userApp.post('/watch/:listingId', verifyToken("USER"), async (req, res) => {
    try {
        const { targetPrice } = req.body

        const listing = await ListingModel.findById(req.params.listingId)
        if (!listing) {
            return res.status(404).json({ message: "Listing not found." })
        }

        //cant watch your own listing
        if (listing.seller.toString() === req.user.id) {
            return res.status(400).json({ message: "You can't watch your own listing." })
        }

        //check if already watching
        const existing = await WatchModel.findOne({ listing: req.params.listingId, user: req.user.id })
        if (existing) {
            return res.status(400).json({ message: "Already watching this listing." })
        }

        const watch = new WatchModel({
            listing: req.params.listingId,
            user: req.user.id,
            priceWhenWatched: listing.price,
            targetPrice: targetPrice || null
        })
        await watch.save()

        return res.status(201).json({ message: "Added to watchlist.", payload: watch })

    } catch (err) {
        return res.status(500).json({ message: "Failed to watch listing.", error: err.message })
    }
})

//unwatch a listing
userApp.delete('/watch/:listingId', verifyToken("USER"), async (req, res) => {
    try {
        await WatchModel.findOneAndDelete({ listing: req.params.listingId, user: req.user.id })
        return res.status(200).json({ message: "Removed from watchlist." })
    } catch (err) {
        return res.status(500).json({ message: "Failed to unwatch.", error: err.message })
    }
})

//check if im watching a listing + total watcher count
userApp.get('/watch/:listingId/status', verifyToken("USER"), async (req, res) => {
    try {
        const isWatching = await WatchModel.findOne({ listing: req.params.listingId, user: req.user.id })
        const count = await WatchModel.countDocuments({ listing: req.params.listingId })

        return res.status(200).json({
            message: "Watch status",
            payload: { isWatching: !!isWatching, count }
        })
    } catch (err) {
        return res.status(500).json({ message: "Failed to get watch status.", error: err.message })
    }
})

//get my watchlist with current price vs price when watched
userApp.get('/watchlist', verifyToken("USER"), async (req, res) => {
    try {
        const watches = await WatchModel
            .find({ user: req.user.id })
            .populate({
                path: 'listing',
                populate: { path: 'seller', select: 'name avatar' }
            })
            .sort({ createdAt: -1 })

        //filter out any where the listing got deleted
        const valid = watches.filter(w => w.listing !== null)

        return res.status(200).json({ message: "Watchlist", payload: valid })
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch watchlist.", error: err.message })
    }
})

//get my notifications
userApp.get('/notifications', verifyToken("USER"), async (req, res) => {
    try {
        const notifications = await NotificationModel
            .find({ user: req.user.id })
            .populate('listing', 'title images')
            .sort({ createdAt: -1 })
            .limit(30)

        const unreadCount = await NotificationModel.countDocuments({ user: req.user.id, isRead: false })

        return res.status(200).json({
            message: "Notifications",
            payload: { notifications, unreadCount }
        })
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch notifications.", error: err.message })
    }
})

//mark all notifications as read
userApp.put('/notifications/read', verifyToken("USER"), async (req, res) => {
    try {
        await NotificationModel.updateMany(
            { user: req.user.id, isRead: false },
            { $set: { isRead: true } }
        )
        return res.status(200).json({ message: "Marked all as read." })
    } catch (err) {
        return res.status(500).json({ message: "Failed to mark as read.", error: err.message })
    }
})