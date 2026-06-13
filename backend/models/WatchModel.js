import mongoose from 'mongoose'

const watchSchema = new mongoose.Schema({
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'listing',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    priceWhenWatched: {
        type: Number,
        required: true
    },
    targetPrice: {
        type: Number,
        default: null
    }
}, { timestamps: true })

//one user cant watch the same listing twice
watchSchema.index({ listing: 1, user: 1 }, { unique: true })

export const WatchModel = mongoose.model('watch', watchSchema)