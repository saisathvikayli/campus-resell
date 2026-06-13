import { Link } from 'react-router-dom'

export default function ListingCard({ listing }) {

    const conditionColors = {
        'New': 'bg-green-100 text-green-700',
        'Like New': 'bg-blue-100 text-blue-700',
        'Good': 'bg-yellow-100 text-yellow-700',
        'Fair': 'bg-red-100 text-red-700'
    }

    return (
        <Link to={`/listing/${listing._id}`}>
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 overflow-hidden">

            {/* image */}
            <div className="w-full h-44 bg-gray-100 overflow-hidden">
                {listing.images && listing.images.length > 0 ? (
                    <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover hover:scale-105 transition duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        No Image
                    </div>
                )}
            </div>

            {/* info */}
            <div className="p-3">
                <h3 className="text-sm font-semibold text-gray-800 truncate">{listing.title}</h3>

                <p className="text-[#B71C1C] font-bold text-base mt-1">₹{listing.price}</p>

                <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${conditionColors[listing.condition]}`}>
                        {listing.condition}
                    </span>
                    <span className="text-xs text-gray-400">{listing.category}</span>
                </div>

                {/* seller */}
                {listing.seller && (
                    <div className="flex items-center gap-2 mt-3 border-t pt-2">
                        {listing.seller.avatar ? (
                            <img src={listing.seller.avatar} className="w-5 h-5 rounded-full object-cover" />
                        ) : (
                            <div className="w-5 h-5 rounded-full bg-[#0D1B4B] flex items-center justify-center text-white text-xs">
                                {listing.seller.name?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <span className="text-xs text-gray-500">{listing.seller.name}</span>
                    </div>
                )}
            </div>
        </div>
        </Link>
    )
}