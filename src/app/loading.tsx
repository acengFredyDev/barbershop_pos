export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="text-center">
        <div className="animate-pulse">
          <h1 className="text-3xl font-bold text-gray-800">Barbershop POS</h1>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
        <div className="mt-6">
          <div className="w-12 h-12 rounded-full border-4 border-t-blue-500 border-b-blue-700 border-gray-200 animate-spin mx-auto"></div>
        </div>
      </div>
    </div>
  );
}