'use client';
const _jsxFileName = "j:\\antigravity\\pdfx\\src\\components\\Signup.tsx"; import React, { useState } from 'react';
import Link from "next/link"; import { useRouter } from "next/navigation";
import useAuth from '../hooks/useAuth';

const Signup = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const { signup } = useAuth();
    const router = useRouter();

    const togglePassword = (id) => {
        const input = document.getElementById(id);
        if (input.type === 'password') {
            input.type = 'text';
        } else {
            input.type = 'password';
        }
    }

    const handleSignup = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        const success = await signup(firstName, lastName, email, password);
        if (success) {
            router.push('/');
        } else {
            setError('User with this email already exists');
        }
    };

    return (
        React.createElement('div', { className: "min-h-screen grid grid-cols-1 md:grid-cols-2 relative overflow-hidden bg-black text-white font-sans", __self: this, __source: { fileName: _jsxFileName, lineNumber: 39 } }
            /* Background Effects */
            , React.createElement('div', { className: "absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(0,255,136,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.03)_1px,transparent_1px)] bg-[size:50px_50px] animate-[gridMove_20s_linear_infinite] z-0", __self: this, __source: { fileName: _jsxFileName, lineNumber: 41 } })
            , React.createElement('div', { className: "absolute w-[500px] h-[500px] bg-[radial-gradient(circle,#00ff88_0%,transparent_70%)] rounded-full filter blur-3xl opacity-40 animate-[float_15s_infinite_ease-in-out] top-[-250px] left-[-250px]", __self: this, __source: { fileName: _jsxFileName, lineNumber: 42 } })
            , React.createElement('div', { className: "absolute w-[400px] h-[400px] bg-[radial-gradient(circle,#00cc66_0%,transparent_70%)] rounded-full filter blur-3xl opacity-40 animate-[float_15s_infinite_ease-in-out_5s] bottom-[-200px] right-1/4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 43 } })
            , React.createElement('div', { className: "absolute w-[350px] h-[350px] bg-[radial-gradient(circle,#00ff88_0%,transparent_70%)] rounded-full filter blur-3xl opacity-40 animate-[float_15s_infinite_ease-in-out_10s] top-1/2 right-[-150px]", __self: this, __source: { fileName: _jsxFileName, lineNumber: 44 } })

            /* Left Side - Branding */
            , React.createElement('div', { className: "relative z-10 hidden md:flex flex-col justify-center py-20 px-24 bg-gradient-to-br from-[rgba(0,255,136,0.08)] via-[rgba(0,0,0,0.5)] to-[rgba(0,0,0,0.5)] backdrop-blur-lg", __self: this, __source: { fileName: _jsxFileName, lineNumber: 47 } }
                , React.createElement('div', { className: "mb-16", __self: this, __source: { fileName: _jsxFileName, lineNumber: 48 } }
                    , React.createElement('div', { className: "inline-flex items-center gap-4 py-3 px-6 bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.2)] rounded-full mb-8", __self: this, __source: { fileName: _jsxFileName, lineNumber: 49 } }
                        , React.createElement('div', { className: "w-9 h-9 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center", __self: this, __source: { fileName: _jsxFileName, lineNumber: 50 } }
                            , React.createElement('svg', { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", className: "w-5 h-5 fill-black", __self: this, __source: { fileName: _jsxFileName, lineNumber: 51 } }
                                , React.createElement('path', { d: "M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z", __self: this, __source: { fileName: _jsxFileName, lineNumber: 52 } })
                            )
                        )
                        , React.createElement('span', { className: "text-3xl font-extrabold text-green-400 tracking-tighter", __self: this, __source: { fileName: _jsxFileName, lineNumber: 55 } }, "PDFy")
                    )

                    , React.createElement('h1', { className: "text-6xl font-extrabold leading-tight mb-6 bg-gradient-to-br from-white to-gray-400 text-transparent bg-clip-text", __self: this, __source: { fileName: _jsxFileName, lineNumber: 58 } }, "Transform chats into professional PDFs")
                    , React.createElement('p', { className: "text-lg text-gray-400 max-w-md mb-12", __self: this, __source: { fileName: _jsxFileName, lineNumber: 59 } }, "The most powerful PDF converter with AI-powered formatting. Perfect for developers, designers, and teams who value quality.")
                )

                , React.createElement('div', { className: "grid grid-cols-1 gap-6", __self: this, __source: { fileName: _jsxFileName, lineNumber: 62 } }
                    , React.createElement('div', { className: "flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-lg", __self: this, __source: { fileName: _jsxFileName, lineNumber: 63 } }
                        , React.createElement('div', { className: "w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center", __self: this, __source: { fileName: _jsxFileName, lineNumber: 64 } }
                            , React.createElement('svg', { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", className: "w-6 h-6 fill-black", __self: this, __source: { fileName: _jsxFileName, lineNumber: 65 } }
                                , React.createElement('path', { d: "M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z", __self: this, __source: { fileName: _jsxFileName, lineNumber: 66 } })
                            )
                        )
                        , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 69 } }
                            , React.createElement('h3', { className: "font-semibold text-white", __self: this, __source: { fileName: _jsxFileName, lineNumber: 70 } }, "Smart Formatting")
                            , React.createElement('p', { className: "text-sm text-gray-400", __self: this, __source: { fileName: _jsxFileName, lineNumber: 71 } }, "Automatically formats code, math, and text.")
                        )
                    )
                    , React.createElement('div', { className: "flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-lg", __self: this, __source: { fileName: _jsxFileName, lineNumber: 74 } }
                        , React.createElement('div', { className: "w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center", __self: this, __source: { fileName: _jsxFileName, lineNumber: 75 } }
                            , React.createElement('svg', { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", className: "w-6 h-6 fill-black", __self: this, __source: { fileName: _jsxFileName, lineNumber: 76 } }
                                , React.createElement('path', { d: "M19.35 10.04C18.67 6.59 15.64 4 12 4c-1.48 0-2.85.43-4.01 1.17l1.46 1.46C10.21 6.23 11.08 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3 0 1.13-.64 2.11-1.56 2.62l1.45 1.45C23.16 18.16 24 16.68 24 15c0-2.64-2.05-4.78-4.65-4.96zM3 5.27l2.75 2.74C2.56 8.15 0 10.77 0 14c0 3.31 2.69 6 6 6h11.73l2 2L21 20.73 4.27 4 3 5.27zM7.73 10l8 8H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h1.73z", __self: this, __source: { fileName: _jsxFileName, lineNumber: 77 } })
                            )
                        )
                        , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 80 } }
                            , React.createElement('h3', { className: "font-semibold text-white", __self: this, __source: { fileName: _jsxFileName, lineNumber: 81 } }, "Cloud Storage")
                            , React.createElement('p', { className: "text-sm text-gray-400", __self: this, __source: { fileName: _jsxFileName, lineNumber: 82 } }, "Save and access your projects from anywhere.")
                        )
                    )
                )
            )

            /* Right Side - Signup Form */
            , React.createElement('div', { className: "relative z-10 flex items-center justify-center py-12 px-6 md:px-16 bg-black/80 backdrop-blur-2xl", __self: this, __source: { fileName: _jsxFileName, lineNumber: 89 } }
                , React.createElement('div', { className: "w-full max-w-md", __self: this, __source: { fileName: _jsxFileName, lineNumber: 90 } }
                    , React.createElement('div', { className: "mb-12 text-center", __self: this, __source: { fileName: _jsxFileName, lineNumber: 91 } }
                        , React.createElement('h2', { className: "text-4xl font-bold mb-3", __self: this, __source: { fileName: _jsxFileName, lineNumber: 92 } }, "Create an account")
                        , React.createElement('p', { className: "text-gray-400", __self: this, __source: { fileName: _jsxFileName, lineNumber: 93 } }, "Already have an account? ", React.createElement(Link, { href: "/login", className: "font-semibold text-green-400 hover:text-green-300 transition-colors", __self: this, __source: { fileName: _jsxFileName, lineNumber: 93 } }, "Sign in"))
                    )

                    , React.createElement('form', { onSubmit: handleSignup, __self: this, __source: { fileName: _jsxFileName, lineNumber: 96 } }
                        , error && React.createElement('p', { className: "text-red-500 mb-4 text-center", __self: this, __source: { fileName: _jsxFileName, lineNumber: 97 } }, error)
                        , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 98 } }
                            , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 99 } }
                                , React.createElement('label', { className: "block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 100 } }, "First Name")
                                , React.createElement('input', { type: "text", value: firstName, onChange: (e) => setFirstName(e.target.value), className: "w-full py-3 px-4 bg-white/5 border-2 border-white/10 rounded-lg text-sm text-white transition-all focus:outline-none focus:border-green-400 focus:bg-white/10 focus:ring-4 focus:ring-green-400/10", placeholder: "John", required: true, __self: this, __source: { fileName: _jsxFileName, lineNumber: 101 } })
                            )
                            , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 103 } }
                                , React.createElement('label', { className: "block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 104 } }, "Last Name")
                                , React.createElement('input', { type: "text", value: lastName, onChange: (e) => setLastName(e.target.value), className: "w-full py-3 px-4 bg-white/5 border-2 border-white/10 rounded-lg text-sm text-white transition-all focus:outline-none focus:border-green-400 focus:bg-white/10 focus:ring-4 focus:ring-green-400/10", placeholder: "Doe", required: true, __self: this, __source: { fileName: _jsxFileName, lineNumber: 105 } })
                            )
                        )

                        , React.createElement('div', { className: "mb-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 109 } }
                            , React.createElement('label', { className: "block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 110 } }, "Email")
                            , React.createElement('input', { type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full py-3 px-4 bg-white/5 border-2 border-white/10 rounded-lg text-sm text-white transition-all focus:outline-none focus:border-green-400 focus:bg-white/10 focus:ring-4 focus:ring-green-400/10", placeholder: "you@example.com", required: true, __self: this, __source: { fileName: _jsxFileName, lineNumber: 111 } })
                        )

                        , React.createElement('div', { className: "mb-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 114 } }
                            , React.createElement('label', { className: "block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 115 } }, "Password")
                            , React.createElement('div', { className: "relative", __self: this, __source: { fileName: _jsxFileName, lineNumber: 116 } }
                                , React.createElement('input', { type: "password", value: password, onChange: (e) => setPassword(e.target.value), className: "w-full py-3 px-4 bg-white/5 border-2 border-white/10 rounded-lg text-sm text-white transition-all focus:outline-none focus:border-green-400 focus:bg-white/10 focus:ring-4 focus:ring-green-400/10", id: "signupPassword", placeholder: "••••••••", required: true, minLength: 8, __self: this, __source: { fileName: _jsxFileName, lineNumber: 117 } })
                                , React.createElement('button', { type: "button", className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-400 transition-colors", onClick: () => togglePassword('signupPassword'), __self: this, __source: { fileName: _jsxFileName, lineNumber: 118 } }
                                    , React.createElement('svg', { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", className: "w-5 h-5 fill-current", __self: this, __source: { fileName: _jsxFileName, lineNumber: 119 } }
                                        , React.createElement('path', { d: "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z", __self: this, __source: { fileName: _jsxFileName, lineNumber: 120 } })
                                    )
                                )
                            )
                        )

                        , React.createElement('div', { className: "mb-6", __self: this, __source: { fileName: _jsxFileName, lineNumber: 126 } }
                            , React.createElement('label', { className: "block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 127 } }, "Confirm Password")
                            , React.createElement('div', { className: "relative", __self: this, __source: { fileName: _jsxFileName, lineNumber: 128 } }
                                , React.createElement('input', { type: "password", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), className: "w-full py-3 px-4 bg-white/5 border-2 border-white/10 rounded-lg text-sm text-white transition-all focus:outline-none focus:border-green-400 focus:bg-white/10 focus:ring-4 focus:ring-green-400/10", id: "confirmPassword", placeholder: "••••••••", required: true, minLength: 8, __self: this, __source: { fileName: _jsxFileName, lineNumber: 129 } })
                                , React.createElement('button', { type: "button", className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-400 transition-colors", onClick: () => togglePassword('confirmPassword'), __self: this, __source: { fileName: _jsxFileName, lineNumber: 130 } }
                                    , React.createElement('svg', { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", className: "w-5 h-5 fill-current", __self: this, __source: { fileName: _jsxFileName, lineNumber: 131 } }
                                        , React.createElement('path', { d: "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z", __self: this, __source: { fileName: _jsxFileName, lineNumber: 132 } })
                                    )
                                )
                            )
                        )

                        , React.createElement('div', { className: "mb-6", __self: this, __source: { fileName: _jsxFileName, lineNumber: 138 } }
                            , React.createElement('label', { className: "flex items-center gap-2 cursor-pointer", __self: this, __source: { fileName: _jsxFileName, lineNumber: 139 } }
                                , React.createElement('input', { type: "checkbox", className: "w-5 h-5 cursor-pointer accent-green-400", required: true, __self: this, __source: { fileName: _jsxFileName, lineNumber: 140 } })
                                , React.createElement('span', { className: "text-sm text-gray-300", __self: this, __source: { fileName: _jsxFileName, lineNumber: 141 } }, "I agree to the ", React.createElement('a', { href: "#", className: "text-green-400 hover:text-green-300", __self: this, __source: { fileName: _jsxFileName, lineNumber: 141 } }, "Terms"), " and ", React.createElement('a', { href: "#", className: "text-green-400 hover:text-green-300", __self: this, __source: { fileName: _jsxFileName, lineNumber: 141 } }, "Privacy Policy"))
                            )
                        )

                        , React.createElement('button', { type: "submit", className: "w-full py-4 bg-gradient-to-br from-green-400 to-green-600 rounded-lg text-base font-bold text-black cursor-pointer transition-all shadow-lg shadow-green-400/40 hover:shadow-xl hover:shadow-green-400/50 hover:-translate-y-0.5 relative overflow-hidden group", __self: this, __source: { fileName: _jsxFileName, lineNumber: 145 } }
                            , React.createElement('span', { className: "relative z-10", __self: this, __source: { fileName: _jsxFileName, lineNumber: 146 } }, "Create Account")
                            , React.createElement('div', { className: "absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-500 group-hover:left-full", __self: this, __source: { fileName: _jsxFileName, lineNumber: 147 } })
                        )
                    )

                    , React.createElement('div', { className: "text-center text-xs text-gray-500 mt-6", __self: this, __source: { fileName: _jsxFileName, lineNumber: 151 } }, "By signing up, you agree to our "
                        , React.createElement('a', { href: "#", className: "text-green-400 hover:underline", __self: this, __source: { fileName: _jsxFileName, lineNumber: 152 } }, "Terms of Service"), " and ", React.createElement('a', { href: "#", className: "text-green-400 hover:underline", __self: this, __source: { fileName: _jsxFileName, lineNumber: 152 } }, "Privacy Policy")
                    )
                )
            )
        )
    );
}

export default Signup;
