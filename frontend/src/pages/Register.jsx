import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api.js'
import toast from 'react-hot-toast'

export default function Register() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: ''
    })
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)
            await api.post('/common/register', formData)
            toast.success('Registration successful! Please login.')
            navigate('/login')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-200 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8">

                <h2 className="text-2xl font-bold text-[#0D1B4B] mb-1">Create Account</h2>
                <p className="text-gray-400 text-sm mb-6">Join the CampusResell community</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="text-sm text-gray-600 mb-1 block">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your name"
                            required
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0D1B4B] transition"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-600 mb-1 block">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0D1B4B] transition"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-600 mb-1 block">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a password"
                            required
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0D1B4B] transition"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-600 mb-1 block">Phone (optional)</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter your phone number"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0D1B4B] transition"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-[#B71C1C] text-white py-2 rounded-lg text-sm font-medium hover:bg-red-800 transition disabled:opacity-60 mt-2">
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-400 mt-5">
                    Already have an account?{' '}
                    <Link to="/login" className="text-[#B71C1C] hover:underline">Login</Link>
                </p>
            </div>
        </div>
    )
}