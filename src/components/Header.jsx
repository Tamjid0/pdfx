'use client';
const _jsxFileName = "j:\\antigravity\\pdfx\\src\\components\\Header.tsx"; import React from 'react';
import Link from "next/link"; import { useRouter } from "next/navigation";
//import useAuth from '../hooks/useAuth';

const Header = () => {
  const { user, logout } = { user: null, logout: () => { } }; //useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    React.createElement('div', { className: "bg-gradient-to-r from-gemini-dark-200 to-gemini-dark-300 h-16 flex items-center justify-between px-8 border-b border-gemini-green/10 shadow-lg z-50", __self: this, __source: { fileName: _jsxFileName, lineNumber: 15 } }
      , React.createElement('div', { className: "flex items-center gap-12", __self: this, __source: { fileName: _jsxFileName, lineNumber: 16 } }
        , React.createElement('div', { className: "text-2xl font-bold text-gemini-green tracking-tight flex items-center gap-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 17 } }
          , React.createElement('svg', { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", fill: "currentColor", className: "w-7 h-7", __self: this, __source: { fileName: _jsxFileName, lineNumber: 18 } }
            , React.createElement('path', { d: "M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z", __self: this, __source: { fileName: _jsxFileName, lineNumber: 19 } })
          ), "PDFy"

        )
        , React.createElement('nav', { className: "flex gap-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 23 } }
          , React.createElement('a', { className: "text-gemini-gray no-underline px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer hover:text-gemini-green hover:bg-gemini-green/10 text-gemini-green bg-gemini-green/15", __self: this, __source: { fileName: _jsxFileName, lineNumber: 24 } }, "Dashboard")
          , React.createElement('a', { className: "text-gemini-gray no-underline px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer hover:text-gemini-green hover:bg-gemini-green/10", __self: this, __source: { fileName: _jsxFileName, lineNumber: 25 } }, "Projects")
          , React.createElement('a', { className: "text-gemini-gray no-underline px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer hover:text-gemini-green hover:bg-gemini-green/10", __self: this, __source: { fileName: _jsxFileName, lineNumber: 26 } }, "Templates")
          , React.createElement('a', { className: "text-gemini-gray no-underline px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer hover:text-gemini-green hover:bg-gemini-green/10", __self: this, __source: { fileName: _jsxFileName, lineNumber: 27 } }, "Community")
        )
      )
      , React.createElement('div', { className: "flex gap-3 items-center", __self: this, __source: { fileName: _jsxFileName, lineNumber: 30 } }

        , user ? (
          React.createElement('div', { className: "flex items-center gap-3 px-3 py-1.5 bg-gemini-dark-300 border border-gemini-dark-500 rounded-full cursor-pointer transition-all ml-3 hover:border-gemini-green hover:bg-[#252525]", __self: this, __source: { fileName: _jsxFileName, lineNumber: 33 } }
            , React.createElement('div', { className: "relative", __self: this, __source: { fileName: _jsxFileName, lineNumber: 34 } }
              , React.createElement('div', { className: "w-8 h-8 rounded-full bg-gradient-to-br from-gemini-green to-gemini-green-400 flex items-center justify-center font-semibold text-sm text-black", __self: this, __source: { fileName: _jsxFileName, lineNumber: 35 } }, user.firstName.charAt(0), user.lastName.charAt(0))
              , React.createElement('div', { className: "w-2 h-2 bg-gemini-green rounded-full border-2 border-gemini-dark-300 absolute bottom-0 right-0", __self: this, __source: { fileName: _jsxFileName, lineNumber: 36 } })
            )
            , React.createElement('span', { className: "text-sm font-medium text-white", __self: this, __source: { fileName: _jsxFileName, lineNumber: 38 } }, user.firstName, " ", user.lastName)
            , React.createElement('button', { onClick: handleLogout, className: "text-gemini-gray no-underline px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer hover:text-gemini-green hover:bg-gemini-green/10", __self: this, __source: { fileName: _jsxFileName, lineNumber: 39 } }, "Logout")
          )
        ) : (
          React.createElement('div', { className: "flex items-center gap-3 ml-3", __self: this, __source: { fileName: _jsxFileName, lineNumber: 42 } }
            , React.createElement(Link, { href: "/login", className: "text-gemini-gray no-underline px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer hover:text-gemini-green hover:bg-gemini-green/10", __self: this, __source: { fileName: _jsxFileName, lineNumber: 43 } }, "Login")
            , React.createElement(Link, { href: "/signup", className: "bg-gemini-green text-black border-none px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all shadow-md shadow-gemini-green/30 flex items-center gap-2 hover:bg-gemini-green-300 hover:shadow-lg hover:shadow-gemini-green/40 hover:-translate-y-px", __self: this, __source: { fileName: _jsxFileName, lineNumber: 44 } }, "Sign Up")
          )
        )
      )
    )
  );
};

export default Header;