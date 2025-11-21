import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const VerificationLanding = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Verification State
    // Verification State
    const [emailVerified, setEmailVerified] = useState(false);


    const [alreadyConfirmed, setAlreadyConfirmed] = useState(false);
    const [confirmedData, setConfirmedData] = useState(null);

    const [candidateData, setCandidateData] = useState({
        _id: '',
        name: 'Abin Sebastian',
        mobileNumber: '+91 9074516446',
        sector: '',
        email: ''
    });

    const [formData, setFormData] = useState({
        email: 'test@gmail.com',
        attendanceStatus: '',
        declaration: false
    });

    const [formErrors, setFormErrors] = useState({});

    // Email Edit State
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [reEnterEmail, setReEnterEmail] = useState('');
    const [originalEmail, setOriginalEmail] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (token) {
                try {
                    const res = await axios.get(`http://localhost:5000/api/candidate/verify/${token}`);
                    const data = res.data;
                    setCandidateData({
                        _id: data._id,
                        name: data.fullName,
                        mobileNumber: data.mobile,
                        sector: data.examCenter,
                        email: data.email
                    });
                    setFormData(prev => ({ ...prev, email: data.email }));
                    setOriginalEmail(data.email);

                   

                   
                } catch (err) {
                    console.error(err);
                    
                } finally {
                    setLoading(false);
                }
            } 
        };

   
        fetchData();
    }, [token]);

    const validateForm = () => {
        const errors = {};
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (isEditingEmail) {
            if (!reEnterEmail) {
                errors.reEnterEmail = 'Please re-enter your email';
            } else if (reEnterEmail !== formData.email) {
                errors.reEnterEmail = 'Emails do not match';
            }
        }

        if (!formData.attendanceStatus) {
            errors.attendanceStatus = 'Please select your attendance confirmation';
        }

        if (!formData.declaration) {
            errors.declaration = 'You must accept the declaration to proceed';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (name === 'email' && emailVerified) {
            setEmailVerified(false);
            toast('Email changed, please verify again.', { icon: '⚠️' });
        }

        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleEditEmail = () => {
        setIsEditingEmail(true);
        setOriginalEmail(formData.email);
        setReEnterEmail('');
        setEmailVerified(false);
    };

    const handleCancelEdit = () => {
        setIsEditingEmail(false);
        setFormData(prev => ({ ...prev, email: originalEmail }));
        setReEnterEmail('');
        setFormErrors(prev => ({ ...prev, email: '', reEnterEmail: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setSubmitting(true);
        setError('');

        // Email Verification Logic
        if (isEditingEmail) {
            // Validation is already handled in validateForm

            if (isDemoMode) {
                setEmailVerified(true);
                setIsEditingEmail(false);
            } else {
                try {
                    await axios.post(`http://localhost:5000/api/candidate/verify-email/${candidateData._id}`, { email: formData.email });
                    setEmailVerified(true);
                    setIsEditingEmail(false);
                } catch (error) {
                    toast.error('Email verification failed');
                    setSubmitting(false);
                    return;
                }
            }
        }

        if (isDemoMode) {
            setTimeout(() => {
                setSuccess('Your confirmation has been recorded successfully. Thank you!');
                setTimeout(() => {
                    setConfirmedData({
                        name: candidateData.name,
                        mobileNumber: candidateData.mobileNumber,
                        sector: candidateData.sector,
                        finalEmail: formData.email,
                        attendanceStatus: formData.attendanceStatus,
                        confirmedAt: new Date().toISOString()
                    });
                    setAlreadyConfirmed(true);
                    setSubmitting(false);
                }, 2000);
            }, 1500);
        } else {
            try {
                await axios.post(`http://localhost:5000/api/candidate/finalize/${candidateData._id}`, {
                    attendanceStatus: formData.attendanceStatus
                });
                setSuccess('Your confirmation has been recorded successfully. Thank you!');
                setTimeout(() => {
                    navigate('/success');
                }, 2000);
            } catch (err) {
                setError(err.response?.data?.message || 'Submission failed');
                setSubmitting(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your details...</p>
                </div>
            </div>
        );
    }

    if (alreadyConfirmed) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
                    <div className="text-center mb-6">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Response Already Recorded</h2>
                        <p className="text-gray-600">Your response has been recorded and cannot be modified further.</p>
                    </div>

                    {confirmedData && (
                        <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                            <h3 className="font-semibold text-gray-900 mb-4">Your Submitted Details:</h3>
                            <div className="grid grid-cols-1 gap-3">
                                <div><label className="text-sm text-gray-600">Name</label><p className="font-medium text-gray-900">{confirmedData.name}</p></div>
                                <div><label className="text-sm text-gray-600">Mobile Number</label><p className="font-medium text-gray-900">{confirmedData.mobileNumber}</p></div>
                                <div><label className="text-sm text-gray-600">Sector</label><p className="font-medium text-gray-900">{confirmedData.sector}</p></div>
                                <div><label className="text-sm text-gray-600">Email</label><p className="font-medium text-gray-900">{confirmedData.finalEmail}</p></div>
                                <div><label className="text-sm text-gray-600">Attendance Status</label><p className="font-medium text-gray-900">{confirmedData.attendanceStatus === 'attending' ? 'Will Attend' : 'Will Not Attend'}</p></div>
                                <div><label className="text-sm text-gray-600">Submitted On</label><p className="font-medium text-gray-900">{new Date(confirmedData.confirmedAt).toLocaleString()}</p></div>
                            </div>
                        </div>
                    )}


                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Examination Confirmation</h1>
                        <p className="text-gray-600">Please verify your details and confirm your attendance</p>

                    </div>

                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex">
                                <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                <p className="text-red-800">{error}</p>
                            </div>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex">
                                <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                <p className="text-green-800">{success}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-blue-50 rounded-lg p-6 space-y-4">
                            <h3 className="font-semibold text-gray-900 mb-4">Your Details</h3>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input type="text" value={candidateData.name} disabled className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label><input type="text" value={candidateData.mobileNumber} disabled className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Sector</label><input type="text" value={candidateData.sector} disabled className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed" /></div>
                        </div>

                        {/* Email Verification Section */}
                        <div className={`p-4 border rounded-lg ${emailVerified ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-medium text-gray-900">2. Email Verification</h3>
                                <div className="flex items-center gap-2">
                                    {emailVerified && <span className="text-green-600 font-bold text-sm">✓ Updated</span>}
                                    {isEditingEmail && (
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className="text-gray-400 hover:text-gray-600 transition-colors"
                                            title="Cancel Edit"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{isEditingEmail ? 'Please Enter the Email Adress' : 'Email Address'} <span className="text-red-500">*</span></label>
                                    <div className="flex gap-2 items-start">
                                        <div className="flex-1 space-y-3">
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                disabled={!isEditingEmail}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.email ? 'border-red-500' : 'border-gray-300'} ${!isEditingEmail ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                placeholder="your.email@example.com"
                                            />

                                            {isEditingEmail && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Re-enter Email <span className="text-red-500">*</span></label>
                                                    <input
                                                        type="password"
                                                        value={reEnterEmail}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            setReEnterEmail(val);

                                                            if (!formData.email) {
                                                                setFormErrors(prev => ({ ...prev, email: 'Email is required' }));
                                                                return;
                                                            }

                                                            if (val !== formData.email) {
                                                                setFormErrors(prev => ({ ...prev, reEnterEmail: 'Emails do not match' }));
                                                            } else {
                                                                setFormErrors(prev => ({ ...prev, reEnterEmail: '' }));
                                                            }
                                                        }}
                                                        onFocus={() => {
                                                            if (!formData.email) {
                                                                setFormErrors(prev => ({ ...prev, email: 'Email is required' }));
                                                            }
                                                        }}
                                                        onPaste={(e) => {
                                                            e.preventDefault();
                                                            toast.error("Copy-paste is not allowed for email confirmation");
                                                        }}
                                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.reEnterEmail ? 'border-red-500' : 'border-gray-300'}`}
                                                        placeholder="Re-enter your email"
                                                    />
                                                    {formErrors.reEnterEmail && <p className="mt-1 text-sm text-red-600">{formErrors.reEnterEmail}</p>}
                                                </div>
                                            )}
                                        </div>

                                        {!emailVerified && !isEditingEmail && (
                                            <button
                                                type="button"
                                                onClick={handleEditEmail}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                                            >
                                                Edit
                                            </button>
                                        )}

                                        {isEditingEmail && (
                                            <div className="flex flex-col gap-2">
                                                {/* Save and Cancel buttons removed as per request */}
                                            </div>
                                        )}
                                    </div>
                                    {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
                                </div>
                            </div>
                        </div>



                        {/* Attendance Confirmation */}
                        <div className="p-4 border border-gray-200 rounded-lg">
                            <h3 className="font-medium text-gray-900 mb-4">3. Attendance Confirmation</h3>
                            <div className="space-y-3">
                                <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="attendanceStatus"
                                        value="attending"
                                        checked={formData.attendanceStatus === 'attending'}
                                        onChange={handleInputChange}
                                        className="mt-1 mr-3 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-gray-700 text-sm">Yes, I will attend the test on either 29/11/2025 or 30/11/2025</span>
                                </label>
                                <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="attendanceStatus"
                                        value="not_attending"
                                        checked={formData.attendanceStatus === 'not_attending'}
                                        onChange={handleInputChange}
                                        className="mt-1 mr-3 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-gray-700 text-sm">No, I will not be able to attend the test on 29/11/2025 or 30/11/2025.</span>
                                </label>
                            </div>
                            {formErrors.attendanceStatus && <p className="mt-1 text-sm text-red-600">{formErrors.attendanceStatus}</p>}
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <label className="flex items-start cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="declaration"
                                    checked={formData.declaration}
                                    onChange={handleInputChange}
                                    className="mt-1 mr-3 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">
                                    <span className="text-red-500">*</span> I confirm that the above details are correct.
                                </span>
                            </label>
                            {formErrors.declaration && <p className="mt-2 text-sm text-red-600">{formErrors.declaration}</p>}
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${submitting
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                                    }`}
                            >
                                {submitting ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Submitting...
                                    </span>
                                ) : (
                                    'Submit Confirmation'
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-600 text-center">For any queries or issues, please contact the examination helpdesk.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerificationLanding;
