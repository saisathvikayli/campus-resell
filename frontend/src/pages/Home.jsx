import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api.js'
import ListingCard from '../components/ListingCard.jsx'
import SkeletonCard from '../components/SkeletonCard.jsx'

export default function Home() {
    const [listings, setListings] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeCategory, setActiveCategory] = useState('All')

    const categories = ['All', 'Books', 'Electronics', 'Hostel', 'Clothing', 'Transport', 'Gaming', 'Other']

    const fetchListings = async (category) => {
        try {
            setLoading(true)
            const params = category && category !== 'All' ? { category } : {}
            const res = await api.get('/common/listings', { params })
            setListings(res.data.payload)
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchListings(activeCategory)
    }, [activeCategory])

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">

            {/* hero */}
            <div className="bg-[#0D1B4B] text-white rounded-2xl px-8 py-10 mb-8 flex flex-col gap-2">
                <h1 className="text-3xl font-bold">Buy & Sell Within Campus</h1>
                <p className="text-gray-300 text-sm mt-1">Find great deals from your fellow students at Anurag University.</p>
                <Link to="/browse"
                    className="mt-4 w-fit bg-[#B71C1C] text-white px-5 py-2 rounded-lg text-sm hover:bg-red-800 transition">
                    Browse All Listings
                </Link>
            </div>

            {/* category pills */}
            <div className="flex gap-2 flex-wrap mb-6">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition
                            ${activeCategory === cat
                                ? 'bg-[#B71C1C] text-white border-[#B71C1C]'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-[#B71C1C] hover:text-[#B71C1C]'
                            }`}>
                        {cat}
                    </button>
                ))}
            </div>

            {/* listings */}
            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            ) : listings.length === 0 ? (
                <div className="text-center text-gray-400 py-20">No listings found.</div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {listings.map(listing => (
                        <ListingCard key={listing._id} listing={listing} />
                    ))}
                </div>
            )}
        </div>
    )
}