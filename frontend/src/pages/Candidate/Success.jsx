import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';

const Success = () => {
    return (
        <Layout>
            <div className="max-w-md mx-auto text-center mt-20">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Verification Successful!</h1>
                <p className="text-gray-600 mb-8">
                    Your details have been verified. You are now ready for the exam.
                </p>
                <Link to="/" className="text-blue-600 hover:underline">
                    Return Home
                </Link>
            </div>
        </Layout>
    );
};

export default Success;
