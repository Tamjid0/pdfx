'use client';
const _jsxFileName = "j:\\antigravity\\pdfx\\src\\components\\Login.tsx"; import React, { useState } from 'react';
import Link from "next/link"; import { useRouter } from "next/navigation";
import useAuth from '../hooks/useAuth';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const router = useRouter();

    const togglePassword = () => {
        const input = document.getElementById('passwordInput');
        if (input.type === 'password') {
            input.type = 'text';
        } else {
            input.type = 'password';
        }
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        const success = await login(email, password);
        if (success) {
            router.push('/');
        } else {
            setError('Invalid email or password');
        }
    };

    return (
        React.createElement('div', { className: "min-h-screen grid grid-cols-1 md:grid-cols-2 relative overflow-hidden bg-black text-white font-sans", __self: this, __source: { fileName: _jsxFileName, lineNumber: 32 } }
            /* Background Effects */
            , React.createElement('div', { className: "absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(0,255,136,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.03)_1px,transparent_1px)] bg-[size:50px_50px] animate-[gridMove_20s_linear_infinite] z-0", __self: this, __source: { fileName: _jsxFileName, lineNumber: 34 } })
            , React.createElement('div', { className: "absolute w-[500px] h-[500px] bg-[radial-gradient(circle,#00ff88_0%,transparent_70%)] rounded-full filter blur-3xl opacity-40 animate-[float_15s_infinite_ease-in-out] top-[-250px] left-[-250px]", __self: this, __source: { fileName: _jsxFileName, lineNumber: 35 } })
            , React.createElement('div', { className: "absolute w-[400px] h-[400px] bg-[radial-gradient(circle,#00cc66_0%,transparent_70%)] rounded-full filter blur-3xl opacity-40 animate-[float_15s_infinite_ease-in-out_5s] bottom-[-200px] right-1/4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 36 } })
            , React.createElement('div', { className: "absolute w-[350px] h-[350px] bg-[radial-gradient(circle,#00ff88_0%,transparent_70%)] rounded-full filter blur-3xl opacity-40 animate-[float_15s_infinite_ease-in-out_10s] top-1/2 right-[-150px]", __self: this, __source: { fileName: _jsxFileName, lineNumber: 37 } })

            /* Left Side - Branding */
            , React.createElement('div', { className: "relative z-10 hidden md:flex flex-col justify-center py-20 px-24 bg-gradient-to-br from-[rgba(0,255,136,0.08)] via-[rgba(0,0,0,0.5)] to-[rgba(0,0,0,0.5)] backdrop-blur-lg", __self: this, __source: { fileName: _jsxFileName, lineNumber: 40 } }
                , React.createElement('div', { className: "mb-16", __self: this, __source: { fileName: _jsxFileName, lineNumber: 41 } }
                    , React.createElement('div', { className: "inline-flex items-center gap-4 py-3 px-6 bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.2)] rounded-full mb-8", __self: this, __source: { fileName: _jsxFileName, lineNumber: 42 } }
                        , React.createElement('div', { className: "w-9 h-9 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center", __self: this, __source: { fileName: _jsxFileName, lineNumber: 43 } }
                            , React.createElement('svg', { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", className: "w-5 h-5 fill-black", __self: this, __source: { fileName: _jsxFileName, lineNumber: 44 } }
                                , React.createElement('path', { d: "M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z", __self: this, __source: { fileName: _jsxFileName, lineNumber: 45 } })
                            )
                        )
                        , React.createElement('span', { className: "text-3xl font-extrabold text-green-400 tracking-tighter", __self: this, __source: { fileName: _jsxFileName, lineNumber: 48 } }, "PDFy")
                    )

                    , React.createElement('h1', { className: "text-6xl font-extrabold leading-tight mb-6 bg-gradient-to-br from-white to-gray-400 text-transparent bg-clip-text", __self: this, __source: { fileName: _jsxFileName, lineNumber: 51 } }, "Transform chats into professional PDFs")
                    , React.createElement('p', { className: "text-lg text-gray-400 max-w-md mb-12", __self: this, __source: { fileName: _jsxFileName, lineNumber: 52 } }, "The most powerful PDF converter with AI-powered formatting. Perfect for developers, designers, and teams who value quality.")
                )

                , React.createElement('div', { className: "grid grid-cols-3 gap-8 pt-12 border-t border-white/10", __self: this, __source: { fileName: _jsxFileName, lineNumber: 55 } }
                    , React.createElement('div', { className: "text-center", __self: this, __source: { fileName: _jsxFileName, lineNumber: 56 } }
                        , React.createElement('div', { className: "text-4xl font-bold text-green-400 mb-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 57 } }, "50K+")
                        , React.createElement('div', { className: "text-xs text-gray-500 uppercase tracking-widest", __self: this, __source: { fileName: _jsxFileName, lineNumber: 58 } }, "Active Users")
                    )
                    , React.createElement('div', { className: "text-center", __self: this, __source: { fileName: _jsxFileName, lineNumber: 60 } }
                        , React.createElement('div', { className: "text-4xl font-bold text-green-400 mb-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 61 } }, "1M+")
                        , React.createElement('div', { className: "text-xs text-gray-500 uppercase tracking-widest", __self: this, __source: { fileName: _jsxFileName, lineNumber: 62 } }, "PDFs Created")
                    )
                    , React.createElement('div', { className: "text-center", __self: this, __source: { fileName: _jsxFileName, lineNumber: 64 } }
                        , React.createElement('div', { className: "text-4xl font-bold text-green-400 mb-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 65 } }, "99.9%")
                        , React.createElement('div', { className: "text-xs text-gray-500 uppercase tracking-widest", __self: this, __source: { fileName: _jsxFileName, lineNumber: 66 } }, "Uptime")
                    )
                )
            )

            /* Right Side - Login Form */
            , React.createElement('div', { className: "relative z-10 flex items-center justify-center py-12 px-6 md:px-16 bg-black/80 backdrop-blur-2xl", __self: this, __source: { fileName: _jsxFileName, lineNumber: 72 } }
                , React.createElement('div', { className: "w-full max-w-md", __self: this, __source: { fileName: _jsxFileName, lineNumber: 73 } }
                    , React.createElement('div', { className: "mb-12", __self: this, __source: { fileName: _jsxFileName, lineNumber: 74 } }
                        , React.createElement('h2', { className: "text-4xl font-bold mb-3", __self: this, __source: { fileName: _jsxFileName, lineNumber: 75 } }, "Welcome back")
                        , React.createElement('p', { className: "text-gray-400", __self: this, __source: { fileName: _jsxFileName, lineNumber: 76 } }, "New to PDFy? ", React.createElement(Link, { href: "/signup", className: "font-semibold text-green-400 hover:text-green-300 transition-colors", __self: this, __source: { fileName: _jsxFileName, lineNumber: 76 } }, "Create an account"))
                    )

                    , React.createElement('form', { onSubmit: handleLogin, __self: this, __source: { fileName: _jsxFileName, lineNumber: 79 } }
                        , error && React.createElement('p', { className: "text-red-500 mb-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 80 } }, error)
                        , React.createElement('div', { className: "mb-6", __self: this, __source: { fileName: _jsxFileName, lineNumber: 81 } }
                            , React.createElement('label', { className: "block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 82 } }, "Email Address")
                            , React.createElement('div', { className: "relative", __self: this, __source: { fileName: _jsxFileName, lineNumber: 83 } }
                                , React.createElement('svg', { className: "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 fill-gray-500 pointer-events-none", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", __self: this, __source: { fileName: _jsxFileName, lineNumber: 84 } }
                                    , React.createElement('path', { d: "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z", __self: this, __source: { fileName: _jsxFileName, lineNumber: 85 } })
                                )
                                , React.createElement('input', { type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full py-4 pr-4 pl-12 bg-white/5 border-2 border-white/10 rounded-lg text-sm text-white transition-all focus:outline-none focus:border-green-400 focus:bg-white/10 focus:ring-4 focus:ring-green-400/10", placeholder: "you@example.com", required: true, __self: this, __source: { fileName: _jsxFileName, lineNumber: 87 } })
                            )
                        )

                        , React.createElement('div', { className: "mb-6", __self: this, __source: { fileName: _jsxFileName, lineNumber: 91 } }
                            , React.createElement('label', { className: "block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 92 } }, "Password")
                            , React.createElement('div', { className: "relative", __self: this, __source: { fileName: _jsxFileName, lineNumber: 93 } }
                                , React.createElement('svg', { className: "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 fill-gray-500 pointer-events-none", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", __self: this, __source: { fileName: _jsxFileName, lineNumber: 94 } }
                                    , React.createElement('path', { d: "M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z", __self: this, __source: { fileName: _jsxFileName, lineNumber: 95 } })
                                )
                                , React.createElement('input', { type: "password", value: password, onChange: (e) => setPassword(e.target.value), className: "w-full py-4 pr-12 pl-12 bg-white/5 border-2 border-white/10 rounded-lg text-sm text-white transition-all focus:outline-none focus:border-green-400 focus:bg-white/10 focus:ring-4 focus:ring-green-400/10", id: "passwordInput", placeholder: "Enter your password", required: true, __self: this, __source: { fileName: _jsxFileName, lineNumber: 97 } })
                                , React.createElement('button', { type: "button", className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-400 transition-colors", onClick: togglePassword, __self: this, __source: { fileName: _jsxFileName, lineNumber: 98 } }
                                    , React.createElement('svg', { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", className: "w-5 h-5 fill-current", __self: this, __source: { fileName: _jsxFileName, lineNumber: 99 } }
                                        , React.createElement('path', { d: "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z", __self: this, __source: { fileName: _jsxFileName, lineNumber: 100 } })
                                    )
                                )
                            )
                        )

                        , React.createElement('div', { className: "flex items-center justify-between mb-8", __self: this, __source: { fileName: _jsxFileName, lineNumber: 106 } }
                            , React.createElement('div', { className: "flex items-center gap-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 107 } }
                                , React.createElement('input', { type: "checkbox", id: "rememberMe", className: "w-5 h-5 cursor-pointer accent-green-400", __self: this, __source: { fileName: _jsxFileName, lineNumber: 108 } })
                                , React.createElement('label', { htmlFor: "rememberMe", className: "text-sm text-gray-300 cursor-pointer select-none", __self: this, __source: { fileName: _jsxFileName, lineNumber: 109 } }, "Remember me")
                            )
                            , React.createElement('a', { href: "#", className: "text-sm font-semibold text-green-400 hover:text-green-300 transition-colors", onClick: (e) => { e.preventDefault(); alert('Password recovery coming soon'); }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 111 } }, "Forgot password?")
                        )

                        , React.createElement('button', { type: "submit", className: "w-full py-4 bg-gradient-to-br from-green-400 to-green-600 rounded-lg text-base font-bold text-black cursor-pointer transition-all shadow-lg shadow-green-400/40 hover:shadow-xl hover:shadow-green-400/50 hover:-translate-y-0.5 relative overflow-hidden group", __self: this, __source: { fileName: _jsxFileName, lineNumber: 114 } }
                            , React.createElement('span', { className: "relative z-10", __self: this, __source: { fileName: _jsxFileName, lineNumber: 115 } }, "Sign In")
                            , React.createElement('div', { className: "absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-500 group-hover:left-full", __self: this, __source: { fileName: _jsxFileName, lineNumber: 116 } })
                        )
                    )

                    , React.createElement('div', { className: "flex items-center gap-5 my-8 text-xs text-gray-500 uppercase tracking-widest", __self: this, __source: { fileName: _jsxFileName, lineNumber: 120 } }
                        , React.createElement('div', { className: "flex-1 h-px bg-white/10", __self: this, __source: { fileName: _jsxFileName, lineNumber: 121 } }), "Or continue with"

                        , React.createElement('div', { className: "flex-1 h-px bg-white/10", __self: this, __source: { fileName: _jsxFileName, lineNumber: 123 } })
                    )

                    , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-3", __self: this, __source: { fileName: _jsxFileName, lineNumber: 126 } }
                        , React.createElement('button', { className: "flex items-center justify-center gap-2 py-3 bg-white/5 border-2 border-white/10 rounded-lg text-sm font-semibold text-white cursor-pointer transition-all hover:bg-white/10 hover:border-green-400 hover:-translate-y-0.5", onClick: () => alert('Google login coming soon'), __self: this, __source: { fileName: _jsxFileName, lineNumber: 127 } }
                            , React.createElement('svg', { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", className: "w-5 h-5", __self: this, __source: { fileName: _jsxFileName, lineNumber: 128 } }
                                , React.createElement('path', { d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z", fill: "#4285F4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 129 } })
                                , React.createElement('path', { d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z", fill: "#34A853", __self: this, __source: { fileName: _jsxFileName, lineNumber: 130 } })
                                , React.createElement('path', { d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z", fill: "#FBBC05", __self: this, __source: { fileName: _jsxFileName, lineNumber: 131 } })
                                , React.createElement('path', { d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z", fill: "#EA4335", __self: this, __source: { fileName: _jsxFileName, lineNumber: 132 } })
                            ), "Google"

                        )
                        , React.createElement('button', { className: "flex items-center justify-center gap-2 py-3 bg-white/5 border-2 border-white/10 rounded-lg text-sm font-semibold text-white cursor-pointer transition-all hover:bg-white/10 hover:border-green-400 hover:-translate-y-0.5", onClick: () => alert('GitHub login coming soon'), __self: this, __source: { fileName: _jsxFileName, lineNumber: 136 } }
                            , React.createElement('svg', { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", fill: "currentColor", className: "w-5 h-5", __self: this, __source: { fileName: _jsxFileName, lineNumber: 137 } }
                                , React.createElement('path', { d: "M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z", __self: this, __source: { fileName: _jsxFileName, lineNumber: 138 } })
                            ), "GitHub"

                        )
                    )

                    , React.createElement('div', { className: "text-center mt-8 pt-8 border-t border-white/10", __self: this, __source: { fileName: _jsxFileName, lineNumber: 144 } }
                        , React.createElement('p', { className: "text-sm text-gray-400", __self: this, __source: { fileName: _jsxFileName, lineNumber: 145 } }, "Don't have an account? ", React.createElement(Link, { href: "/signup", className: "font-semibold text-green-400 hover:text-green-300 transition-colors", __self: this, __source: { fileName: _jsxFileName, lineNumber: 145 } }, "Sign up for free"))
                    )
                )
            )
        )
    );
}

export default Login;
