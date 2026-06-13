import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api.js'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [formData, setFormData] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)
            const res = await api.post('/common/login', formData)
            login(res.data.payload)
            toast.success('Login successful.')
            navigate('/')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8">

                <h2 className="text-2xl font-bold text-[#0D1B4B] mb-1">Welcome Back</h2>
                <p className="text-gray-400 text-sm mb-6">Login to your CampusResell account</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                            placeholder="Enter your password"
                            required
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0D1B4B] transition"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-[#B71C1C] text-white py-2 rounded-lg text-sm font-medium hover:bg-red-800 transition disabled:opacity-60 mt-2">
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-400 mt-5">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-[#B71C1C] hover:underline">Register</Link>
                </p>
            </div>
        </div>
    )
}