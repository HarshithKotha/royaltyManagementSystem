import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-teal-500 to-teal-600 flex flex-col">
      {/* Navbar */}
      <nav className="w-full bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50">
        <div className="w-full max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-2 group">
            <div className="text-teal-600 text-3xl font-bold group-hover:scale-105 transition-transform duration-300">
              Royalty Management System
            </div>
          </div>
          <div className="space-x-8">
            <Link
              to="/login"
              className="text-teal-600 hover:text-teal-900 text-xl font-semibold py-2 transition-colors duration-300"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative flex-grow flex flex-col justify-center items-center text-center px-10 py-24 overflow-hidden">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-8 drop-shadow-lg">
          Manage Your Royalties Seamlessly
        </h1>
        <p className="text-white text-xl md:text-2xl max-w-4xl mb-12">
          A modern platform designed to provide transparency, efficiency, and control over artist royalties.
        </p>
        <div className="space-x-6">
          <Link
            to="/login"
            className="group relative inline-flex items-center justify-center px-8 py-4 text-xl font-semibold text-teal-600 transition-all duration-500 ease-in-out transform bg-white rounded-xl hover:scale-105 hover:rotate-1 shadow-lg"
          >
            <span className="relative z-10 group-hover:text-white transition-colors duration-300">Get Started</span>
            <div className="absolute inset-0 rounded-xl bg-teal-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <section className="w-full bg-white py-24 px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-teal-600 mb-16">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[{
              title: "Role-Based Access Control",
              desc: "Admins, Artists, and Managers get secure access with permissions.",
            }, {
              title: "Automated Royalty Calculations",
              desc: "Royalties are calculated based on streams using a pre-defined slab system.",
            }, {
              title: "Performance Insights",
              desc: "Dashboards provide real-time analytics on top-performing songs and artists.",
            }].map((feature, index) => (
              <div key={index} className="group relative p-8 border rounded-xl bg-white shadow-lg cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                <h3 className="text-2xl font-semibold mb-4 text-teal-600">{feature.title}</h3>
                <p className="text-gray-600 text-lg mb-4">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full bg-gray-50 py-24 px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-teal-600 mb-16">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {["Artists and Managers log in with role-based access.",
              "Artists can add songs, request managers, and track royalties.",
              "Admins oversee user accounts, transactions, and generate reports."].map((step, index) => (
              <div key={index} className="relative p-8 border rounded-xl bg-white shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-teal-600 text-white text-xl font-semibold rounded-full w-12 h-12 flex items-center justify-center">
                  {index + 1}
                </span>
                <p className="text-gray-700 text-lg mt-6">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Info */}
      <section className="w-full bg-gray-50 py-24 px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-teal-600 mb-16">How to Register?</h2>
          <p className="text-lg text-gray-700 mb-8">
            Please contact the Admin for more details.
          </p>
          <div className="text-lg font-semibold text-teal-700">
            <p>Email: royaltymanagementrms@gmail.com</p>
            <p>Phone: +91 7093148469</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-gradient-to-b from-teal-700 to-teal-800 text-white text-center py-12">
        <div className="max-w-7xl mx-auto px-8">
          <p className="text-lg group hover:scale-105 transition-transform duration-300 inline-block">
            &copy; 2025 Royalty Management. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
