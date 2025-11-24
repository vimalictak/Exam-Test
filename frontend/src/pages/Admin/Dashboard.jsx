import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const Dashboard = () => {
    const [candidates, setCandidates] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [activeTab, setActiveTab] = useState('list'); // 'list', 'upload', 'campaigns'
    const { register, handleSubmit, reset } = useForm();
    const { register: registerCampaign, handleSubmit: handleSubmitCampaign, reset: resetCampaign } = useForm();
    const token = localStorage.getItem('adminToken');

    const fetchCandidates = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/candidates`, {
                headers: { Authorization: token }
            });
            setCandidates(res.data);
        } catch (error) {
            toast.error('Failed to fetch candidates');
        }
    };

    const fetchCampaignHistory = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/campaign/history`, {
                headers: { Authorization: token }
            });
            setCampaigns(res.data.campaigns || []);
        } catch (error) {
            toast.error('Failed to fetch campaign history');
        }
    };

    useEffect(() => {
        if (activeTab === 'list') {
            fetchCandidates();
        } else if (activeTab === 'campaigns') {
            fetchCampaignHistory();
        }
    }, [activeTab]);

    const onSendCampaign = async (data) => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/campaign/send`, data, {
                headers: { Authorization: token }
            });
            toast.success('Campaign sent successfully');
            resetCampaign();
            fetchCampaignHistory();
        } catch (error) {
            toast.error('Failed to send campaign');
        }
    };

    const onUpload = async (data) => {
        const formData = new FormData();
        if (data.file[0]) {
            formData.append('file', data.file[0]);
        } else {
            // Manual entry
            formData.append('fullName', data.fullName);
            formData.append('email', data.email);
            formData.append('mobile', data.mobile);
            formData.append('sector', data.sector);
        }

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/upload`, formData, {
                headers: {
                    Authorization: token,
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
            await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/resend/${id}`, {}, {
                headers: { Authorization: token }
            });
            toast.success('Verification link resent');
        } catch (error) {
            toast.error('Failed to resend link');
        }
    };

    const handleResendSms = async (id) => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/resend/sms/${id}`, {}, {
                headers: { Authorization: token }
            });
            toast.success('SMS resent successfully');
        } catch (error) {
            toast.error('Failed to resend SMS');
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
                    <Button
                        variant={activeTab === 'campaigns' ? 'primary' : 'outline'}
                        onClick={() => setActiveTab('campaigns')}
                    >
                        Campaigns
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sector</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token Used</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email Updated</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {candidates.map((candidate) => (
                                <tr key={candidate._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{candidate.fullName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{candidate.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{candidate.mobile}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{candidate.sector || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${candidate.status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {candidate.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${candidate.isTokenUsed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {candidate.isTokenUsed ? 'Yes' : 'No'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${candidate.isEmailUpdated ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {candidate.isEmailUpdated ? 'Yes' : 'No'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {candidate.attendanceStatus === true ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Present</span>
                                        ) : candidate.attendanceStatus === false ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Absent</span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Pending</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(candidate.createdAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        {candidate.status !== 'verified' ?(
                                            <>
                                                <button
                                                    onClick={() => handleResend(candidate._id)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    Resend Link
                                                </button>
                                                <button
                                                    onClick={() => handleResendSms(candidate._id)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Resend SMS
                                                </button>
                                            </>
                                        ) : (
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${candidate.status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {candidate.status}
                                        </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : activeTab === 'upload' ? (
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
                                <Input label="Sector" {...register('sector')} />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit">Save Candidate</Button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium mb-4">Send Campaign</h3>
                        <form onSubmit={handleSubmitCampaign(onSendCampaign)} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Input label="Campaign Name" {...registerCampaign('campaignName', { required: true })} />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Message Type</label>
                                    <select {...registerCampaign('messageType')} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                                        <option value="SMS">SMS</option>
                                        <option value="WHATSAPP">WhatsApp</option>
                                    </select>
                                </div>
                                <Input label="Template ID (Optional)" {...registerCampaign('templateId')} />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter</label>
                                    <select {...registerCampaign('filter')} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                                        <option value="ALL">All Candidates</option>
                                        <option value="VERIFIED">Verified Only</option>
                                        <option value="PENDING">Pending Only</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea {...registerCampaign('message', { required: true })} rows={4} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit">Send Campaign</Button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium">Campaign History</h3>
                        </div>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {campaigns.map((campaign) => (
                                    <tr key={campaign._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">{campaign.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{campaign.type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${campaign.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {campaign.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{campaign.stats?.sent || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{new Date(campaign.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Dashboard;
