import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api.js'
import toast from 'react-hot-toast'

export default function PostItem() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [images, setImages] = useState([])
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        condition: ''
    })

    const categories = ['Books', 'Electronics', 'Hostel', 'Clothing', 'Transport', 'Gaming', 'Other']
    const conditions = ['New', 'Like New', 'Good', 'Fair']

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleImages = (e) => {
        const selected = Array.from(e.target.files)
        const combined = [...images, ...selected]
        if (combined.length > 4) {
            toast.error('Maximum 4 images allowed.')
            return
        }
        setImages(combined)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (images.length === 0) {
            toast.error('Please add at least one image.')
            return
        }
        try {
            setLoading(true)
            const data = new FormData()
            data.append('title', formData.title)
            data.append('description', formData.description)
            data.append('price', formData.price)
            data.append('category', formData.category)
            data.append('condition', formData.condition)
            images.forEach(img => data.append('images', img))

            await api.post('/user/listings', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            toast.success('Listing posted!')
            navigate('/')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to post listing.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold text-[#0D1B4B] mb-6">Post a Listing</h2>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-5">

                <div>
                    <label className="text-sm text-gray-600 mb-1 block">Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. Engineering Maths Textbook"
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
                        placeholder="Describe your item..."
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
                        placeholder="Enter price"
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
                    <label className="text-sm text-gray-600 mb-1 block">Images (max 4)</label>

                    {images.length === 0 && (
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImages}
                            className="w-full text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-2"
                        />
                    )}

                    {images.length > 0 && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                            {images.map((img, i) => (
                                <div key={i} className="relative">
                                    <img
                                        src={URL.createObjectURL(img)}
                                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setImages(images.filter((_, index) => index !== i))}
                                        className="absolute -top-1 -right-1 bg-[#B71C1C] text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                                        ×
                                    </button>
                                </div>
                            ))}
                            {images.length < 4 && (
                                <label className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-[#B71C1C] transition">
                                    <span className="text-gray-400 text-2xl">+</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImages}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#B71C1C] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-800 transition disabled:opacity-60">
                    {loading ? 'Posting...' : 'Post Listing'}
                </button>
            </form>
        </div>
    )
}