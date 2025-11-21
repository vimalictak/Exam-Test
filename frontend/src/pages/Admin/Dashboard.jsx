import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const Dashboard = () => {
    const [candidates, setCandidates] = useState([]);
    const [activeTab, setActiveTab] = useState('list'); // 'list' or 'upload'
    const { register, handleSubmit, reset } = useForm();
    const token = localStorage.getItem('adminToken');

    const fetchCandidates = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/candidates', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCandidates(res.data);
        } catch (error) {
            toast.error('Failed to fetch candidates');
        }
    };

    useEffect(() => {
        if (activeTab === 'list') {
            fetchCandidates();
        }
    }, [activeTab]);

    const onUpload = async (data) => {
        const formData = new FormData();
        if (data.file[0]) {
            formData.append('file', data.file[0]);
        } else {
            // Manual entry
            formData.append('fullName', data.fullName);
            formData.append('email', data.email);
            formData.append('mobile', data.mobile);
            formData.append('registrationId', data.registrationId);
            formData.append('examCenter', data.examCenter);
        }

        try {
            await axios.post('http://localhost:5000/api/admin/upload', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success('Candidate(s) added successfully');
            reset();
            setActiveTab('list');
        } catch (error) {
            toast.error('Upload failed');
        }
    };

    const handleResend = async (id) => {
        try {
            await axios.post(`http://localhost:5000/api/admin/resend/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Verification link resent');
        } catch (error) {
            toast.error('Failed to resend link');
        }
    };

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <div className="flex gap-2">
                    <Button
                        variant={activeTab === 'list' ? 'primary' : 'outline'}
                        onClick={() => setActiveTab('list')}
                    >
                        Candidate List
                    </Button>
                    <Button
                        variant={activeTab === 'upload' ? 'primary' : 'outline'}
                        onClick={() => setActiveTab('upload')}
                    >
                        Add / Upload
                    </Button>
                </div>
            </div>

            {activeTab === 'list' ? (
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {candidates.map((candidate) => (
                                <tr key={candidate._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{candidate.fullName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{candidate.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${candidate.status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {candidate.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleResend(candidate._id)}
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            Resend Link
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-lg shadow max-w-2xl mx-auto">
                    <h3 className="text-lg font-medium mb-4">Add Candidate</h3>
                    <form onSubmit={handleSubmit(onUpload)} className="space-y-4">
                        <div className="border-b pb-4 mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Option 1: Upload CSV</h4>
                            <input type="file" {...register('file')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Option 2: Manual Entry</h4>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Input label="Full Name" {...register('fullName')} />
                                <Input label="Email" {...register('email')} />
                                <Input label="Mobile" {...register('mobile')} />
                                <Input label="Registration ID" {...register('registrationId')} />
                                <Input label="Exam Center" {...register('examCenter')} />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit">Save Candidate</Button>
                        </div>
                    </form>
                </div>
            )}
        </Layout>
    );
};

export default Dashboard;
