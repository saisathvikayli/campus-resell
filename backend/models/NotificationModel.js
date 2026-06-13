import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'listing',
        default: null
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

export const NotificationModel = mongoose.model('notification', notificationSchema)