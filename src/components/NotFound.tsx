import { Link } from "react-router-dom";
import { Home, AlertCircle } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <AlertCircle size={64} className="text-red-500" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">404 - Not Found</h1>
        <p className="text-gray-400 mb-8">
          The conversation you're looking for doesn't exist or has been deleted.
        </p>
        <Link
          to="/chat"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Home size={20} />
          Return Home
        </Link>
      </div>
    </div>
  );
}
