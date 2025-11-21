import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const token = localStorage.getItem('adminToken');

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link to="/" className="text-xl font-bold text-blue-600">
                                CandidateVerify
                            </Link>
                        </div>
                        <div className="flex items-center gap-4">
                            {token ? (
                                <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-gray-900">
                                    Logout
                                </button>
                            ) : (
                                <Link to="/admin/login" className="text-sm text-gray-600 hover:text-gray-900">
                                    Admin Login
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
};

export default Layout;
