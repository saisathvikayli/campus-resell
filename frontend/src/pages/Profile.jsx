import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import toast from 'react-hot-toast'
import ListingCard from '../components/ListingCard.jsx'

export default function Profile() {
    const { user, login, logout } = useAuth()
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const activeTab = searchParams.get('tab') || 'profile'

    const [profile, setProfile] = useState(null)
    const [listings, setListings] = useState([])
    const [loading, setLoading] = useState(true)
    const [listingStatus, setListingStatus] = useState('active')

    const [editData, setEditData] = useState({ name: '', phone: '' })
    const [avatarFile, setAvatarFile] = useState(null)
    const [editLoading, setEditLoading] = useState(false)

    useEffect(() => {
        if (!user) {
            navigate('/login')
            return
        }
        fetchProfile()
    }, [user])

    useEffect(() => {
        if (activeTab === 'listings') fetchListings()
    }, [activeTab, listingStatus])

    const fetchProfile = async () => {
        try {
            const res = await api.get('/user/profile')
            setProfile(res.data.payload)
            setEditData({ name: res.data.payload.name, phone: res.data.payload.phone || '' })
        } catch (err) {
            toast.error('Failed to load profile.')
        } finally {
            setLoading(false)
        }
    }

    const fetchListings = async () => {
        try {
            const res = await api.get(`/user/listings?status=${listingStatus}`)
            setListings(res.data.payload)
        } catch (err) {
            console.log(err)
        }
    }

    const handleEditSubmit = async (e) => {
        e.preventDefault()
        try {
            setEditLoading(true)
            const data = new FormData()
            data.append('name', editData.name)
            data.append('phone', editData.phone)
            if (avatarFile) data.append('avatar', avatarFile)

            const res = await api.put('/user/profile', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            login({ ...user, name: res.data.payload.name, avatar: res.data.payload.avatar })
            toast.success('Profile updated.')
            fetchProfile()
            setSearchParams({ tab: 'profile' })
        } catch (err) {
            toast.error('Failed to update profile.')
        } finally {
            setEditLoading(false)
        }
    }

    const handleMarkSold = async (id) => {
        try {
            await api.put(`/user/listings/${id}/sold`)
            toast.success('Marked as sold.')
            fetchListings()
        } catch (err) {
            toast.error('Failed to mark as sold.')
        }
    }

    const handleDelete = async (id) => {
        try {
            await api.delete(`/user/listings/${id}`)
            toast.success('Listing deleted.')
            fetchListings()
        } catch (err) {
            toast.error('Failed to delete listing.')
        }
    }

    const handleRenew = async (id) => {
        try {
            await api.put(`/user/listings/${id}/renew`)
            toast.success('Listing renewed.')
            fetchListings()
        } catch (err) {
            toast.error('Failed to renew.')
        }
    }

    if (loading) return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="animate-pulse flex flex-col gap-4">
                <div className="h-32 bg-gray-200 rounded-2xl"></div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-52 bg-gray-200 rounded-xl"></div>
                    ))}
                </div>
            </div>
        </div>
    )

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">

            {/* tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
                {['profile', 'listings', 'edit'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setSearchParams({ tab })}
                        className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition
                            ${activeTab === tab
                                ? 'border-[#B71C1C] text-[#B71C1C]'
                                : 'border-transparent text-gray-500 hover:text-[#0D1B4B]'
                            }`}>
                        {tab === 'edit' ? 'Edit Profile' : tab === 'listings' ? 'My Listings' : 'Profile'}
                    </button>
                ))}
            </div>

            {/* profile tab */}
            {activeTab === 'profile' && profile && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-6">
                    {profile.avatar ? (
                        <img src={profile.avatar} className="w-20 h-20 rounded-full object-cover" />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-[#0D1B4B] flex items-center justify-center text-white text-2xl font-bold">
                            {profile.name?.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="flex flex-col gap-1">
                        <h2 className="text-xl font-bold text-[#0D1B4B]">{profile.name}</h2>
                        <p className="text-sm text-gray-500">{profile.email}</p>
                        {profile.phone && <p className="text-sm text-gray-500">{profile.phone}</p>}
                        <p className="text-xs text-gray-400 mt-1">
                            Member since {new Date(profile.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            )}

            {/* listings tab */}
            {activeTab === 'listings' && (
                <div>
                    <div className="flex gap-2 mb-5">
                        {['active', 'sold', 'expired'].map(s => (
                            <button
                                key={s}
                                onClick={() => setListingStatus(s)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition capitalize
                                    ${listingStatus === s
                                        ? 'bg-[#0D1B4B] text-white border-[#0D1B4B]'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-[#0D1B4B]'
                                    }`}>
                                {s}
                            </button>
                        ))}
                    </div>

                    {listings.length === 0 ? (
                        <div className="text-center text-gray-400 py-20">No {listingStatus} listings.</div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {listings.map(listing => (
                                <div key={listing._id} className="flex flex-col gap-2">
                                    <ListingCard listing={listing} />
                                    <div className="flex gap-2">
                                        {!listing.isSold && (
                                            <>
                                                <button
                                                    onClick={() => navigate(`/listing/${listing._id}/edit`)}
                                                    className="flex-1 text-xs bg-[#0D1B4B] text-white py-1.5 rounded-lg hover:bg-blue-900 transition">
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleMarkSold(listing._id)}
                                                    className="flex-1 text-xs bg-green-500 text-white py-1.5 rounded-lg hover:bg-green-600 transition">
                                                    Mark Sold
                                                </button>
                                            </>
                                        )}
                                        {listingStatus === 'expired' && (
                                            <button
                                                onClick={() => handleRenew(listing._id)}
                                                className="flex-1 text-xs bg-yellow-500 text-white py-1.5 rounded-lg hover:bg-yellow-600 transition">
                                                Renew
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(listing._id)}
                                            className="flex-1 text-xs bg-[#B71C1C] text-white py-1.5 rounded-lg hover:bg-red-800 transition">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* edit tab */}
            {activeTab === 'edit' && (
                <form onSubmit={handleEditSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-5 max-w-md">
                    <h3 className="text-lg font-semibold text-[#0D1B4B]">Edit Profile</h3>

                    <div>
                        <label className="text-sm text-gray-600 mb-1 block">Name</label>
                        <input
                            type="text"
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0D1B4B] transition"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-600 mb-1 block">Phone</label>
                        <input
                            type="text"
                            value={editData.phone}
                            onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0D1B4B] transition"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-600 mb-1 block">Avatar</label>
                        {profile?.avatar && (
                            <img src={profile.avatar} className="w-16 h-16 rounded-full object-cover mb-2" />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setAvatarFile(e.target.files[0])}
                            className="w-full text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-2"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={editLoading}
                        className="bg-[#B71C1C] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-800 transition disabled:opacity-60">
                        {editLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            )}
        </div>
    )
}