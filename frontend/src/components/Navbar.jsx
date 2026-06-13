import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../services/api.js'
import toast from 'react-hot-toast'
import logo from '../assets/logo-navbar-ondark.svg'

export default function Navbar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [search, setSearch] = useState('')
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)

    //notifications
    const [notifOpen, setNotifOpen] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)

    //fetch notifications when logged in
    useEffect(() => {
        if (!user) return
        fetchNotifications()
        //poll every 30 seconds for new ones
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }, [user])

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/user/notifications')
            setNotifications(res.data.payload.notifications)
            setUnreadCount(res.data.payload.unreadCount)
        } catch (err) {
            console.log(err)
        }
    }

    const openNotifications = async () => {
        setNotifOpen(!notifOpen)
        //mark all as read when opening
        if (!notifOpen && unreadCount > 0) {
            try {
                await api.put('/user/notifications/read')
                setUnreadCount(0)
            } catch (err) {
                console.log(err)
            }
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        if (search.trim()) {
            navigate(`/browse?search=${search}`)
            setSearch('')
            setMenuOpen(false)
        }
    }

    const handleLogout = async () => {
        try {
            await api.post('/user/logout')
            logout()
            toast.success('Logged out successfully.')
            navigate('/')
        } catch (err) {
            toast.error('Logout failed.')
        }
    }

    return (
        <nav className="bg-[#0D1B4B] text-white shadow-md">
            <div className="px-4 py-3 flex items-center justify-between">

                {/* logo */}
                <Link to="/">
                    <img src={logo} alt="CampusResell" className="h-8" />
                </Link>

                {/* search — hidden on mobile */}
                <form onSubmit={handleSearch} className="hidden md:flex items-center bg-white rounded-lg overflow-hidden w-1/3">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search listings..."
                        className="px-3 py-2 text-gray-800 text-sm w-full outline-none"
                    />
                    <button type="submit" className="bg-[#B71C1C] px-4 py-2 text-white text-sm hover:bg-red-800 transition">
                        Search
                    </button>
                </form>

                {/* desktop right side */}
                <div className="hidden md:flex items-center gap-5">
                    {!user ? (
                        <>
                            <Link to="/login" className="text-sm hover:text-gray-300 transition">Login</Link>
                            <Link to="/register" className="bg-[#B71C1C] text-white text-sm px-4 py-2 rounded-lg hover:bg-red-800 transition">Register</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/post" className="bg-[#B71C1C] text-white text-sm px-4 py-2 rounded-lg hover:bg-red-800 transition">
                                + Post Item
                            </Link>

                            {/* notification bell */}
                            <div className="relative">
                                <button onClick={openNotifications} className="relative hover:text-gray-300 transition text-xl">
                                    🔔
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-[#B71C1C] text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {notifOpen && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white text-gray-800 rounded-lg shadow-lg z-50 overflow-hidden max-h-96 overflow-y-auto">
                                        <div className="px-4 py-3 border-b border-gray-100 font-semibold text-sm text-[#0D1B4B]">
                                            Notifications
                                        </div>
                                        {notifications.length === 0 ? (
                                            <div className="px-4 py-6 text-center text-gray-400 text-sm">
                                                No notifications yet.
                                            </div>
                                        ) : (
                                            notifications.map(n => (
                                                <div
                                                    key={n._id}
                                                    onClick={() => {
                                                        if (n.listing?._id) navigate(`/listing/${n.listing._id}`)
                                                        setNotifOpen(false)
                                                    }}
                                                    className={`px-4 py-3 text-sm border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition
                                                        ${!n.isRead ? 'bg-blue-50' : ''}`}>
                                                    <p className="text-gray-700">{n.message}</p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {new Date(n.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* profile dropdown */}
                            <div className="relative">
                                <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 hover:text-gray-300 transition">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-[#B71C1C] flex items-center justify-center text-sm font-bold">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="text-sm">{user.name}</span>
                                    <span className="text-xs">▼</span>
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg z-50 overflow-hidden">
                                        <Link to="/profile" onClick={() => setDropdownOpen(false)}
                                            className="block px-4 py-3 text-sm hover:bg-gray-100 transition">
                                            My Profile
                                        </Link>
                                        <Link to="/profile?tab=listings" onClick={() => setDropdownOpen(false)}
                                            className="block px-4 py-3 text-sm hover:bg-gray-100 transition">
                                            My Listings
                                        </Link>
                                        <Link to="/watchlist" onClick={() => setDropdownOpen(false)}
                                            className="block px-4 py-3 text-sm hover:bg-gray-100 transition">
                                            My Watchlist
                                        </Link>
                                        <Link to="/profile?tab=edit" onClick={() => setDropdownOpen(false)}
                                            className="block px-4 py-3 text-sm hover:bg-gray-100 transition">
                                            Edit Profile
                                        </Link>
                                        <button onClick={() => { handleLogout(); setDropdownOpen(false) }}
                                            className="w-full text-left px-4 py-3 text-sm text-[#B71C1C] hover:bg-gray-100 transition">
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* hamburger — mobile only */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="md:hidden flex flex-col gap-1.5 p-1">
                    <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                    <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? 'opacity-0' : ''}`}></span>
                    <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                </button>
            </div>

            {/* mobile menu */}
            {menuOpen && (
                <div className="md:hidden bg-[#0D1B4B] border-t border-blue-900 px-4 py-4 flex flex-col gap-4">

                    {/* mobile search */}
                    <form onSubmit={handleSearch} className="flex items-center bg-white rounded-lg overflow-hidden">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search listings..."
                            className="px-3 py-2 text-gray-800 text-sm w-full outline-none"
                        />
                        <button type="submit" className="bg-[#B71C1C] px-4 py-2 text-white text-sm">
                            Search
                        </button>
                    </form>

                    {!user ? (
                        <div className="flex flex-col gap-2">
                            <Link to="/login" onClick={() => setMenuOpen(false)}
                                className="text-sm text-center py-2 border border-white rounded-lg hover:bg-white hover:text-[#0D1B4B] transition">
                                Login
                            </Link>
                            <Link to="/register" onClick={() => setMenuOpen(false)}
                                className="text-sm text-center py-2 bg-[#B71C1C] rounded-lg hover:bg-red-800 transition">
                                Register
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3 pb-2 border-b border-blue-900">
                                {user.avatar ? (
                                    <img src={user.avatar} className="w-8 h-8 rounded-full object-cover" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-[#B71C1C] flex items-center justify-center text-sm font-bold">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span className="text-sm font-medium">{user.name}</span>
                            </div>

                            <Link to="/post" onClick={() => setMenuOpen(false)}
                                className="text-sm text-center py-2 bg-[#B71C1C] rounded-lg hover:bg-red-800 transition">
                                + Post Item
                            </Link>
                            <Link to="/profile" onClick={() => setMenuOpen(false)}
                                className="text-sm py-2 hover:text-gray-300 transition">
                                My Profile
                            </Link>
                            <Link to="/profile?tab=listings" onClick={() => setMenuOpen(false)}
                                className="text-sm py-2 hover:text-gray-300 transition">
                                My Listings
                            </Link>
                            <Link to="/watchlist" onClick={() => setMenuOpen(false)}
                                className="text-sm py-2 hover:text-gray-300 transition">
                                My Watchlist
                            </Link>
                            <Link to="/profile?tab=edit" onClick={() => setMenuOpen(false)}
                                className="text-sm py-2 hover:text-gray-300 transition">
                                Edit Profile
                            </Link>
                            <button onClick={() => { handleLogout(); setMenuOpen(false) }}
                                className="text-sm text-left py-2 text-[#B71C1C] hover:text-red-400 transition">
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            )}
        </nav>
    )
}