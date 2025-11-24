import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Layout from '../../components/Layout';

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/login`, data);
            localStorage.setItem('adminToken', res.data.token);
            toast.success('Logged in successfully');
            navigate('/admin/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        }
    };

    return (
        <Layout>
            <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Input
                        label="Username"
                        {...register('username', { required: 'Username is required' })}
                        error={errors.username}
                    />
                    <Input
                        label="Password"
                        type="password"
                        {...register('password', { required: 'Password is required' })}
                        error={errors.password}
                    />
                    <Button type="submit" className="w-full mt-4">Login</Button>
                </form>
            </div>
        </Layout>
    );
};

export default Login;
