import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import Browse from './pages/Browse.jsx'
import ListingDetail from './pages/ListingDetail.jsx'
import PostItem from './pages/PostItem.jsx'
import EditListing from './pages/EditListing.jsx'
import Profile from './pages/Profile.jsx'
import SellerProfile from './pages/SellerProfile.jsx'
import Watchlist from './pages/Watchlist.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster position="top-center" />
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/browse" element={<Browse />} />
                <Route path="/listing/:id" element={<ListingDetail />} />
                <Route path="/listing/:id/edit" element={<EditListing />} />
                <Route path="/post" element={<PostItem />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/seller/:id" element={<SellerProfile />} />
                <Route path="/watchlist" element={<Watchlist />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </div>
    )
}