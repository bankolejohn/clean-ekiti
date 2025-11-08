export default function ReportsSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 md:px-6 py-4 border-b">
        <div className="h-6 bg-gray-200 rounded w-32 loading-skeleton"></div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 md:px-6 py-3 text-left">
                <div className="h-4 bg-gray-200 rounded w-16 loading-skeleton"></div>
              </th>
              <th className="px-4 md:px-6 py-3 text-left">
                <div className="h-4 bg-gray-200 rounded w-12 loading-skeleton"></div>
              </th>
              <th className="px-4 md:px-6 py-3 text-left">
                <div className="h-4 bg-gray-200 rounded w-16 loading-skeleton"></div>
              </th>
              <th className="px-4 md:px-6 py-3 text-left">
                <div className="h-4 bg-gray-200 rounded w-16 loading-skeleton"></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 md:px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-20 loading-skeleton"></div>
                </td>
                <td className="px-4 md:px-6 py-4">
                  <div className="h-6 bg-gray-200 rounded w-16 loading-skeleton"></div>
                </td>
                <td className="px-4 md:px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-24 loading-skeleton"></div>
                </td>
                <td className="px-4 md:px-6 py-4">
                  <div className="flex space-x-2">
                    <div className="h-4 bg-gray-200 rounded w-12 loading-skeleton"></div>
                    <div className="h-4 bg-gray-200 rounded w-12 loading-skeleton"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}