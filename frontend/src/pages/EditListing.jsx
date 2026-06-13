import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api.js'
import toast from 'react-hot-toast'

export default function EditListing() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [submitLoading, setSubmitLoading] = useState(false)
    const [existingImages, setExistingImages] = useState([])
    const [newImages, setNewImages] = useState([])
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        condition: ''
    })

    const categories = ['Books', 'Electronics', 'Hostel', 'Clothing', 'Transport', 'Gaming', 'Other']
    const conditions = ['New', 'Like New', 'Good', 'Fair']

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const res = await api.get(`/common/listings/${id}`)
                const l = res.data.payload
                setFormData({
                    title: l.title,
                    description: l.description,
                    price: l.price,
                    category: l.category,
                    condition: l.condition
                })
                setExistingImages(l.images)
            } catch (err) {
                toast.error('Listing not found.')
                navigate('/')
            } finally {
                setLoading(false)
            }
        }
        fetchListing()
    }, [id])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleNewImages = (e) => {
        const selected = Array.from(e.target.files)
        const combined = [...newImages, ...selected]
        const total = existingImages.length + combined.length
        if (total > 4) {
            toast.error('Maximum 4 images allowed in total.')
            return
        }
        setNewImages(combined)
    }

    const removeExistingImage = (index) => {
        setExistingImages(existingImages.filter((_, i) => i !== index))
    }

    const removeNewImage = (index) => {
        setNewImages(newImages.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (existingImages.length === 0 && newImages.length === 0) {
            toast.error('At least one image is required.')
            return
        }
        try {
            setSubmitLoading(true)
            const data = new FormData()
            data.append('title', formData.title)
            data.append('description', formData.description)
            data.append('price', formData.price)
            data.append('category', formData.category)
            data.append('condition', formData.condition)

            // send existing image urls as kept images
            existingImages.forEach(img => data.append('existingImages', img))

            // send new image files
            newImages.forEach(img => data.append('images', img))

            await api.put(`/user/listings/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            toast.success('Listing updated.')
            navigate(`/listing/${id}`)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update listing.')
        } finally {
            setSubmitLoading(false)
        }
    }

    if (loading) return <div className="text-center text-gray-400 py-20">Loading...</div>

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold text-[#0D1B4B] mb-6">Edit Listing</h2>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-5">

                <div>
                    <label className="text-sm text-gray-600 mb-1 block">Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0D1B4B] transition"
                    />
                </div>

                <div>
                    <label className="text-sm text-gray-600 mb-1 block">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0D1B4B] transition resize-none"
                    />
                </div>

                <div>
                    <label className="text-sm text-gray-600 mb-1 block">Price (₹)</label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0D1B4B] transition"
                    />
                </div>

                <div>
                    <label className="text-sm text-gray-600 mb-1 block">Category</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0D1B4B] transition">
                        <option value="">Select category</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="text-sm text-gray-600 mb-1 block">Condition</label>
                    <select
                        name="condition"
                        value={formData.condition}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0D1B4B] transition">
                        <option value="">Select condition</option>
                        {conditions.map(con => (
                            <option key={con} value={con}>{con}</option>
                        ))}
                    </select>
                </div>

                {/* images */}
                <div>
                    <label className="text-sm text-gray-600 mb-2 block">
                        Images ({existingImages.length + newImages.length}/4)
                    </label>

                    <div className="flex gap-2 flex-wrap">
                        {/* existing images */}
                        {existingImages.map((img, i) => (
                            <div key={i} className="relative">
                                <img src={img} className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                                <button
                                    type="button"
                                    onClick={() => removeExistingImage(i)}
                                    className="absolute -top-1 -right-1 bg-[#B71C1C] text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                                    ×
                                </button>
                            </div>
                        ))}

                        {/* new images preview */}
                        {newImages.map((img, i) => (
                            <div key={i} className="relative">
                                <img src={URL.createObjectURL(img)} className="w-16 h-16 object-cover rounded-lg border border-blue-200" />
                                <button
                                    type="button"
                                    onClick={() => removeNewImage(i)}
                                    className="absolute -top-1 -right-1 bg-[#B71C1C] text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                                    ×
                                </button>
                            </div>
                        ))}

                        {/* add more */}
                        {existingImages.length + newImages.length < 4 && (
                            <label className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-[#B71C1C] transition">
                                <span className="text-gray-400 text-2xl">+</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleNewImages}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => navigate(`/listing/${id}`)}
                        className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitLoading}
                        className="flex-1 bg-[#B71C1C] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-800 transition disabled:opacity-60">
                        {submitLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    )
}