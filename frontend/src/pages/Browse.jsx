import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../services/api.js'
import ListingCard from '../components/ListingCard.jsx'
import SkeletonCard from '../components/SkeletonCard.jsx'

export default function Browse() {
    const [searchParams] = useSearchParams()
    const [listings, setListings] = useState([])
    const [loading, setLoading] = useState(true)

    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        category: searchParams.get('category') || '',
        condition: '',
        minPrice: '',
        maxPrice: ''
    })

    const categories = ['Books', 'Electronics', 'Hostel', 'Clothing', 'Transport', 'Gaming', 'Other']
    const conditions = ['New', 'Like New', 'Good', 'Fair']

    const fetchListings = async () => {
        try {
            setLoading(true)
            const params = {}
            if (filters.search) params.search = filters.search
            if (filters.category) params.category = filters.category
            if (filters.condition) params.condition = filters.condition
            if (filters.minPrice) params.minPrice = filters.minPrice
            if (filters.maxPrice) params.maxPrice = filters.maxPrice

            const res = await api.get('/common/listings', { params })
            setListings(res.data.payload)
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchListings()
    }, [filters])

    // sync search param from navbar on first load
    useEffect(() => {
        const s = searchParams.get('search')
        if (s) setFilters(prev => ({ ...prev, search: s }))
    }, [searchParams])

    const handleChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value })
    }

    const clearFilters = () => {
        setFilters({ search: '', category: '', condition: '', minPrice: '', maxPrice: '' })
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-6 flex gap-6">

            {/* sidebar */}
            <div className="w-56 shrink-0">
                <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-[#0D1B4B] text-sm">Filters</h3>
                        <button onClick={clearFilters} className="text-xs text-[#B71C1C] hover:underline">Clear</button>
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Search</label>
                        <input
                            type="text"
                            name="search"
                            value={filters.search}
                            onChange={handleChange}
                            placeholder="Search..."
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0D1B4B]"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Category</label>
                        <select
                            name="category"
                            value={filters.category}
                            onChange={handleChange}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0D1B4B]">
                            <option value="">All</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Condition</label>
                        <select
                            name="condition"
                            value={filters.condition}
                            onChange={handleChange}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0D1B4B]">
                            <option value="">All</option>
                            {conditions.map(con => (
                                <option key={con} value={con}>{con}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Min Price (₹)</label>
                        <input
                            type="number"
                            name="minPrice"
                            value={filters.minPrice}
                            onChange={handleChange}
                            placeholder="0"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0D1B4B]"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Max Price (₹)</label>
                        <input
                            type="number"
                            name="maxPrice"
                            value={filters.maxPrice}
                            onChange={handleChange}
                            placeholder="99999"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0D1B4B]"
                        />
                    </div>
                </div>
            </div>

            {/* listings */}
            <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-[#0D1B4B]">
                        {loading ? 'Loading...' : `${listings.length} listing${listings.length !== 1 ? 's' : ''} found`}
                    </h2>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : listings.length === 0 ? (
                    <div className="text-center text-gray-400 py-20">No listings found.</div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {listings.map(listing => (
                            <ListingCard key={listing._id} listing={listing} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}