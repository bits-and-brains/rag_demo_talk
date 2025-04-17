import { useState, useEffect } from 'react';
import axios from 'axios';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export default function LogsView() {
    const [logs, setLogs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/logs`, {
                params: {
                    page: currentPage,
                    pageSize: pageSize
                }
            });
            setLogs(response.data.items);
            setTotalItems(response.data.total);
        } catch (err) {
            setError('Failed to fetch logs. Please try again later.');
            console.error('Error fetching logs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [currentPage, pageSize]);

    const totalPages = Math.ceil(totalItems / pageSize);

    const handlePageSizeChange = (event) => {
        const newPageSize = parseInt(event.target.value);
        setPageSize(newPageSize);
        setCurrentPage(1); // Reset to first page when changing page size
    };

    return (
        <div className="p-4">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold">System Logs</h2>
                <div className="flex items-center gap-2">
                    <label htmlFor="pageSize" className="text-sm">Items per page:</label>
                    <select
                        id="pageSize"
                        value={pageSize}
                        onChange={handlePageSizeChange}
                        className="border rounded px-2 py-1"
                    >
                        {PAGE_SIZE_OPTIONS.map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-4">Loading...</div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-6 py-3 border-b text-left">Timestamp</th>
                                    <th className="px-6 py-3 border-b text-left">Level</th>
                                    <th className="px-6 py-3 border-b text-left">Message</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 border-b">{new Date(log.timestamp).toLocaleString()}</td>
                                        <td className="px-6 py-4 border-b">
                                            <span className={`px-2 py-1 rounded text-sm ${
                                                log.level === 'ERROR' ? 'bg-red-100 text-red-800' :
                                                log.level === 'WARN' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                                {log.level}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 border-b">{log.message}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border rounded disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border rounded disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
} 