export default function SkeletonCard() {
    return (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
            <div className="w-full h-44 bg-gray-200"></div>
            <div className="p-3 flex flex-col gap-2">
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="flex gap-2 mt-1">
                    <div className="h-3 bg-gray-200 rounded-full w-16"></div>
                    <div className="h-3 bg-gray-200 rounded-full w-16"></div>
                </div>
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                    <div className="w-5 h-5 rounded-full bg-gray-200"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
            </div>
        </div>
    )
}