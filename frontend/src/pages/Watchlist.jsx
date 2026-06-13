import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import toast from 'react-hot-toast'

export default function Watchlist() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [watches, setWatches] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) {
            navigate('/login')
            return
        }
        fetchWatchlist()
    }, [user])

    const fetchWatchlist = async () => {
        try {
            const res = await api.get('/user/watchlist')
            setWatches(res.data.payload)
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    const handleUnwatch = async (listingId, e) => {
        e.stopPropagation()
        try {
            await api.delete(`/user/watch/${listingId}`)
            setWatches(watches.filter(w => w.listing._id !== listingId))
            toast.success('Removed from watchlist.')
        } catch (err) {
            toast.error('Failed to remove.')
        }
    }

    const conditionColors = {
        'New': 'bg-green-100 text-green-700',
        'Like New': 'bg-blue-100 text-blue-700',
        'Good': 'bg-yellow-100 text-yellow-700',
        'Fair': 'bg-red-100 text-red-700'
    }

    if (loading) return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="animate-pulse flex flex-col gap-3">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
                ))}
            </div>
        </div>
    )

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold text-[#0D1B4B] mb-6">My Watchlist</h2>

            {watches.length === 0 ? (
                <div className="text-center text-gray-400 py-20">
                    You're not watching any listings yet.
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {watches.map(w => {
                        const listing = w.listing
                        const priceDrop = w.priceWhenWatched - listing.price
                        const priceRose = listing.price - w.priceWhenWatched

                        return (
                            <div
                                key={w._id}
                                onClick={() => navigate(`/listing/${listing._id}`)}
                                className="bg-white rounded-xl border border-gray-100 p-3 flex gap-4 cursor-pointer hover:shadow-md transition">

                                {/* image */}
                                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                    {listing.images?.length > 0 ? (
                                        <img src={listing.images[0]} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                            No Image
                                        </div>
                                    )}
                                </div>

                                {/* info */}
                                <div className="flex-1 min-w-0 flex flex-col gap-1">
                                    <h3 className="text-sm font-semibold text-[#0D1B4B] truncate">{listing.title}</h3>

                                    {/* price + change */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[#B71C1C] font-bold text-base">Rs.{listing.price}</span>

                                        {priceDrop > 0 && (
                                            <span className="text-xs text-green-600 font-medium">
                                                ↓ dropped Rs.{priceDrop} (was Rs.{w.priceWhenWatched})
                                            </span>
                                        )}
                                        {priceRose > 0 && (
                                            <span className="text-xs text-gray-400">
                                                ↑ went up Rs.{priceRose} (was Rs.{w.priceWhenWatched})
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${conditionColors[listing.condition]}`}>
                                            {listing.condition}
                                        </span>
                                        {listing.isSold && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
                                                Sold
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* unwatch */}
                                <button
                                    onClick={(e) => handleUnwatch(listing._id, e)}
                                    className="shrink-0 text-xs text-[#B71C1C] hover:underline self-start">
                                    Remove
                                </button>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
