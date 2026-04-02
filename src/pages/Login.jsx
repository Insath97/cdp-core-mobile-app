// pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Mail,
    Lock,
    ArrowRight,
    Eye,
    EyeOff
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

import logo from '../assets/logo.jpg';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth(); // I'll add this to AuthContext next
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Show loading toast and store its ID
        const loadingToastId = toast.loading('Authenticating...', {
            position: 'bottom-right',
            duration: Infinity // Keep it until we manually dismiss
        });

        try {
            await login({ email, password });
            // Dismiss loading toast on success
            toast.dismiss(loadingToastId);
            navigate('/');
        } catch (error) {
            // Dismiss loading toast on error
            toast.dismiss(loadingToastId);
            // Error toast is already shown by AuthContext
            // No need to show another error toast here
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-700 lg:max-h-[80vh]">

                {/* Visual Side (Hidden on mobile) */}
                <div className="hidden lg:flex flex-col justify-between p-6 bg-primary-600 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-700 opacity-90"></div>

                    {/* Abstract Shapes */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary-400/20 rounded-full blur-3xl"></div>

                    <div className="relative z-10 flex flex-col items-center flex-grow justify-center">
                        <div className="flex flex-col items-center gap-4 bg-white/10 w-fit px-6 py-6 lg:px-8 lg:py-8 rounded-[2.5rem] backdrop-blur-xl border border-white/20 shadow-2xl">
                            <div className="w-32 h-32 lg:w-40 lg:h-40 bg-white rounded-3xl p-4 shadow-2xl overflow-hidden flex items-center justify-center transform hover:scale-105 transition-transform duration-500 ring-4 ring-white/10 shrink-0">
                                <img src={logo} alt="CDP Logo" className="w-full h-full object-contain" />
                            </div>
                            <div className="flex flex-col items-center text-white leading-none">
                                <span className="text-5xl lg:text-6xl font-black tracking-tighter">CDP</span>
                                <span className="text-[14px] lg:text-[16px] font-bold text-primary-200 uppercase tracking-[0.5em] mt-1.5">Core</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Side */}
                <div className="p-6 sm:p-8 flex flex-col justify-center relative overflow-y-auto w-full">
                    {/* Mobile/Tablet Logo & App Name (Only visible below lg) */}
                    <div className="lg:hidden mb-6 flex flex-col items-center">
                        <div className="flex flex-col items-center gap-3 bg-white p-4 rounded-3xl shadow-xl border border-gray-100 w-full max-w-[200px]">
                            <div className="w-16 h-16 bg-white rounded-xl p-2 shadow-md overflow-hidden flex items-center justify-center border border-gray-50 ring-4 ring-gray-50/50">
                                <img src={logo} alt="CDP Logo" className="w-full h-full object-contain" />
                            </div>
                            <div className="flex flex-col items-center leading-none">
                                <span className="text-3xl font-black text-gray-900 tracking-tighter">CDP</span>
                                <span className="text-[10px] font-bold text-primary-600 uppercase tracking-[0.4em] mt-1">Core</span>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-0.5">Welcome Back</h2>
                        <p className="text-gray-500 font-medium mb-0 text-xs">Log in to your agent console to continue</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-bold text-gray-700 ml-1">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-3 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-primary-600/5 focus:border-primary-600 transition-all text-[15px] font-medium"
                                    disabled={isLoading}
                                    autoComplete="off"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[13px] font-bold text-gray-700">Password</label>
                                {/* <Link to="/forgot-password" size="sm" className="text-[11px] font-bold text-primary-600 hover:text-primary-700">Forgot Password?</Link> */}
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full pl-11 pr-11 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-primary-600/5 focus:border-primary-600 transition-all text-[15px] font-medium"
                                    disabled={isLoading}
                                    autoComplete="off"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                                    disabled={isLoading}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* <div className="flex items-center gap-2.5 py-1">
                            <input
                                type="checkbox"
                                id="remember"
                                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                                disabled={isLoading}
                            />
                            <label htmlFor="remember" className="text-xs font-semibold text-gray-500 cursor-pointer">Keep me logged in on this device</label>
                        </div> */}

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={cn(
                                    "w-full py-2.5 bg-primary-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20 hover:shadow-primary-600/40 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none",
                                    isLoading && "cursor-wait"
                                )}
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span className="text-[15px]">Sign In to Dashboard</span>
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                        <p className="text-gray-500 text-[13px] font-medium">
                            Don't have an agent account? <br className="sm:hidden" />
                            <button className="text-primary-600 font-bold ml-1 hover:underline">Contact Branch Support</button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;