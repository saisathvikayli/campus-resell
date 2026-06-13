import express from 'express'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { config } from 'dotenv'
import { commonApp } from './apis/CommonApi.js'
import { userApp } from './apis/UserApi.js'
config()

const app = express()

//middleware
const allowedOrigins = [
    'http://localhost:5173',
    'https://campus-resell-five.vercel.app'
]

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

//db connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("DB connected"))
.catch((err) => console.log("DB connection failed", err))

//routes
app.use('/api/common', commonApp)
app.use('/api/user', userApp)

//start server
const PORT = process.env.PORT || 8000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))