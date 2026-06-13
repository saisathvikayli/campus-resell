import { useNavigate } from 'react-router-dom'

export default function NotFound() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 gap-4">
            <div className="text-7xl font-bold text-[#0D1B4B]">404</div>
            <h2 className="text-xl font-semibold text-gray-700">Page not found</h2>
            <p className="text-sm text-gray-400 text-center">
                The page you're looking for doesn't exist or has been moved.
            </p>
            <button
                onClick={() => navigate('/')}
                className="mt-2 bg-[#B71C1C] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-red-800 transition">
                Go back home
            </button>
        </div>
    )
}