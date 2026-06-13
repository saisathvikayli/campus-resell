import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import toast from 'react-hot-toast'

export default function ListingDetail() {
    const { id } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [listing, setListing] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeImage, setActiveImage] = useState(0)

    //watch state
    const [isWatching, setIsWatching] = useState(false)
    const [watcherCount, setWatcherCount] = useState(0)
    const [watchLoading, setWatchLoading] = useState(false)

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const res = await api.get(`/common/listings/${id}`)
                setListing(res.data.payload)
            } catch (err) {
                toast.error('Listing not found.')
                navigate('/')
            } finally {
                setLoading(false)
            }
        }
        fetchListing()
    }, [id])

    //fetch watch status once we have a logged in user
    useEffect(() => {
        const fetchWatchStatus = async () => {
            if (!user) return
            try {
                const res = await api.get(`/user/watch/${id}/status`)
                setIsWatching(res.data.payload.isWatching)
                setWatcherCount(res.data.payload.count)
            } catch (err) {
                console.log(err)
            }
        }
        fetchWatchStatus()
    }, [id, user])

    const toggleWatch = async () => {
        if (!user) {
            navigate('/login')
            return
        }
        try {
            setWatchLoading(true)
            if (isWatching) {
                await api.delete(`/user/watch/${id}`)
                setIsWatching(false)
                setWatcherCount(prev => prev - 1)
                toast.success('Removed from watchlist.')
            } else {
                await api.post(`/user/watch/${id}`, {})
                setIsWatching(true)
                setWatcherCount(prev => prev + 1)
                toast.success('Added to watchlist.')
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong.')
        } finally {
            setWatchLoading(false)
        }
    }

    const conditionColors = {
        'New': 'bg-green-100 text-green-700',
        'Like New': 'bg-blue-100 text-blue-700',
        'Good': 'bg-yellow-100 text-yellow-700',
        'Fair': 'bg-red-100 text-red-700'
    }

    if (loading) return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-200 rounded-xl h-80"></div>
                <div className="flex flex-col gap-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-20 bg-gray-200 rounded-xl"></div>
                    <div className="h-12 bg-gray-200 rounded-xl"></div>
                </div>
            </div>
        </div>
    )

    if (!listing) return null

    const waLink = `https://wa.me/${listing.seller?.phone}?text=Hi, I'm interested in your listing: ${listing.title}`
    const isOwner = user && user.id === listing.seller?._id

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* images */}
                <div className="flex flex-col gap-3">
                    <div className="w-full h-80 bg-gray-100 rounded-xl overflow-hidden">
                        <img
                            src={listing.images[activeImage]}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {listing.images.length > 1 && (
                        <div className="flex gap-2">
                            {listing.images.map((img, i) => (
                                <img
                                    key={i}
                                    src={img}
                                    onClick={() => setActiveImage(i)}
                                    className={`w-16 h-16 object-cover rounded-lg cursor-pointer border-2 transition
                                        ${activeImage === i ? 'border-[#B71C1C]' : 'border-transparent'}`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* details */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-bold text-[#0D1B4B]">{listing.title}</h1>
                            <p className="text-[#B71C1C] text-2xl font-bold mt-1">Rs.{listing.price}</p>
                        </div>

                        {/* watch heart button — only for non-owners */}
                        {!isOwner && (
                            <button
                                onClick={toggleWatch}
                                disabled={watchLoading}
                                className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition
                                    ${isWatching
                                        ? 'bg-[#B71C1C] text-white border-[#B71C1C]'
                                        : 'bg-white text-[#B71C1C] border-[#B71C1C] hover:bg-red-50'
                                    }`}>
                                <span>{isWatching ? '♥' : '♡'}</span>
                                {isWatching ? 'Watching' : 'Watch'}
                            </button>
                        )}
                    </div>

                    {/* watcher count — only seller sees it on own listing */}
                    {isOwner && (
                        <div className="bg-blue-50 text-[#0D1B4B] text-sm rounded-xl px-4 py-2 w-fit">
                            👀 {watcherCount} {watcherCount === 1 ? 'student is' : 'students are'} watching this
                        </div>
                    )}

                    <div className="flex gap-2">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${conditionColors[listing.condition]}`}>
                            {listing.condition}
                        </span>
                        <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                            {listing.category}
                        </span>
                        {listing.isSold && (
                            <span className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-700 font-medium">
                                Sold
                            </span>
                        )}
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-1">Description</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{listing.description}</p>
                    </div>

                    {/* seller info */}
                    {listing.seller && (
                        <div
                            onClick={() => navigate(`/seller/${listing.seller._id}`)}
                            className="bg-gray-50 rounded-xl p-4 flex items-center gap-3 border border-gray-100 cursor-pointer hover:border-[#0D1B4B] transition">
                            {listing.seller.avatar ? (
                                <img src={listing.seller.avatar} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-[#0D1B4B] flex items-center justify-center text-white font-bold">
                                    {listing.seller.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <p className="text-sm font-semibold text-[#0D1B4B]">{listing.seller.name}</p>
                                <p className="text-xs text-gray-400">{listing.seller.email}</p>
                                <p className="text-xs text-[#B71C1C] mt-0.5">View profile</p>
                            </div>
                        </div>
                    )}

                    {/* contact — only for other users */}
                    {user && !isOwner && (
                        <div className="flex flex-col gap-2">
                            {listing.seller?.phone ? (
                                <a href={waLink} target="_blank" rel="noreferrer"
                                    className="bg-green-500 text-white text-sm text-center py-3 rounded-xl font-medium hover:bg-green-600 transition">
                                    Contact on WhatsApp
                                </a>
                            ) : (
                                <div className="bg-gray-100 text-gray-500 text-sm text-center py-3 rounded-xl">
                                    Seller has no phone number —
                                    <span
                                        onClick={() => navigate(`/seller/${listing.seller._id}`)}
                                        className="text-[#0D1B4B] font-medium cursor-pointer hover:underline ml-1">
                                        view their profile
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* own listing actions */}
                    {isOwner && (
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate(`/listing/${listing._id}/edit`)}
                                className="flex-1 bg-[#0D1B4B] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-900 transition">
                                Edit Listing
                            </button>
                        </div>
                    )}

                    {!user && (
                        <p className="text-sm text-gray-400 text-center">
                            <span
                                className="text-[#B71C1C] cursor-pointer hover:underline"
                                onClick={() => navigate('/login')}>
                                Login
                            </span> to contact the seller
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}