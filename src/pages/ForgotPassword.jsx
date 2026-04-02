import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Mail,
    ArrowLeft,
    CheckCircle2,
    ArrowRight,
    Loader2,
    ShieldCheck
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate network delay for verification
        setTimeout(() => {
            setIsLoading(false);
            setIsSubmitted(true);
        }, 2000);
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 sm:p-12 text-center"
                >
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce duration-[3000ms]">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Check your email</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        We've sent a password reset link to <br />
                        <span className="font-bold text-gray-900">{email}</span>
                    </p>
                    <div className="space-y-4">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold shadow-xl shadow-primary-600/20 hover:shadow-primary-600/40 transition-all active:scale-95"
                        >
                            Open Email App
                        </button>
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary-600 transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Back to login
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
                <div className="p-8 sm:p-12">
                    <div className="mb-10 text-center">
                        <div className="inline-flex p-3 rounded-2xl bg-primary-50 text-primary-600 mb-6 font-bold">
                            <ShieldCheck size={32} />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Password Recovery</h2>
                        <p className="text-gray-500 font-medium px-4">
                            Enter your email frequency and we'll send you instructions to reset your password.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Work Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="e.g. agent@nexus.com"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary-600/5 focus:border-primary-600 transition-all text-gray-900 font-medium"
                                    autoComplete="off"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={cn(
                                "w-full py-4 bg-primary-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary-600/20 hover:shadow-primary-600/40 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none",
                                isLoading && "cursor-wait"
                            )}
                        >
                            {isLoading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    <span>Send Reset Link</span>
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-gray-50 text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary-600 transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Return to sign in
                        </Link>
                    </div>
                </div>

                {/* Branding Footer */}
                <div className="bg-gray-50 py-6 px-8 flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-[10px] uppercase tracking-widest font-black text-gray-400">
                        Nexus Security Protocol v2.4
                    </span>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
