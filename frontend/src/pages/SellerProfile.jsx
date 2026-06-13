import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api.js'
import toast from 'react-hot-toast'
import ListingCard from '../components/ListingCard.jsx'

export default function SellerProfile() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [seller, setSeller] = useState(null)
    const [listings, setListings] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSeller = async () => {
            try {
                const res = await api.get(`/common/seller/${id}`)
                setSeller(res.data.payload.seller)
                setListings(res.data.payload.listings)
            } catch (err) {
                toast.error('Seller not found.')
                navigate('/')
            } finally {
                setLoading(false)
            }
        }
        fetchSeller()
    }, [id])

    if (loading) return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="animate-pulse flex flex-col gap-6">
                <div className="bg-gray-200 rounded-2xl h-32 w-full"></div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-gray-200 rounded-xl h-52"></div>
                    ))}
                </div>
            </div>
        </div>
    )

    if (!seller) return null

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">

            {/* seller card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5">
                {seller.avatar ? (
                    <img src={seller.avatar} className="w-16 h-16 rounded-full object-cover" />
                ) : (
                    <div className="w-16 h-16 rounded-full bg-[#0D1B4B] flex items-center justify-center text-white text-2xl font-bold">
                        {seller.name?.charAt(0).toUpperCase()}
                    </div>
                )}
                <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-bold text-[#0D1B4B]">{seller.name}</h2>
                    <p className="text-sm text-gray-500">{seller.email}</p>
                    {seller.phone && (
                        <p className="text-sm text-gray-500">{seller.phone}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                        Member since {new Date(seller.createdAt).toLocaleDateString()}
                    </p>
                </div>
            </div>

            {/* listings */}
            <div>
                <h3 className="text-lg font-semibold text-[#0D1B4B] mb-4">
                    Active Listings ({listings.length})
                </h3>

                {listings.length === 0 ? (
                    <div className="text-center text-gray-400 py-16">
                        This seller has no active listings.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {listings.map(listing => (
                            <ListingCard key={listing._id} listing={listing} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}