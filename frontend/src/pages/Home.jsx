import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const Home = () => {
    return (
        <Layout>
            <div className="text-center mt-20">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Exam Candidate Verification</h1>
                <p className="text-xl text-gray-600 mb-8">Secure and fast verification system.</p>
                <Link
                    to="/admin/login"
                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
                >
                    Admin Login
                </Link>
            </div>
        </Layout>
    );
};

export default Home;
