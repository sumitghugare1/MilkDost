'use client';

import { Crown, Shield, Sparkles, Star, Heart, Zap, Coffee, Globe, User, Github, Mail, Calendar, Rocket, Award } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-dark via-dark/95 to-dark/85 text-cream py-8 mt-16 overflow-hidden z-10">
      {/* Enhanced background decoration */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-sage/15 to-transparent rounded-full -translate-y-32 translate-x-32 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-sage/15 to-transparent rounded-full translate-y-24 -translate-x-24 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-gradient-to-br from-cream/5 to-transparent rounded-full -translate-x-16 -translate-y-16 animate-pulse delay-500"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Enhanced Brand Section */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
              <div className="relative p-3 bg-gradient-to-br from-cream via-cream/90 to-cream/80 rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-500 group cursor-pointer">
                <div className="absolute inset-0 bg-white/20 rounded-2xl"></div>
                <Heart size={24} className="text-sage relative group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-sage to-sage/80 rounded-full flex items-center justify-center group-hover:animate-bounce">
                  <Crown size={10} className="text-cream" />
                </div>
                <div className="absolute inset-0 rounded-2xl border border-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div>
                <h3 className="text-xl font-black bg-gradient-to-r from-cream via-sage to-cream bg-clip-text text-transparent">
                  Ksheera
                </h3>
                <div className="flex items-center space-x-1">
                  <Shield size={10} className="text-sage" />
                  <span className="text-xs text-cream/70 font-medium">The Future of Dairy, Today.</span>
                  <Sparkles size={8} className="text-sage animate-pulse" />
                </div>
              </div>
            </div>
            <p className="text-cream/80 text-sm font-medium max-w-md mx-auto md:mx-0 leading-relaxed">
              Revolutionizing dairy business operations with intelligent automation, comprehensive tracking, and modern solutions for dairy excellence.
            </p>
          </div>

          {/* Enhanced Features Section */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <h4 className="text-lg font-black text-cream">Core Features</h4>
              <Sparkles size={16} className="text-sage animate-pulse" />
            </div>
            <ul className="space-y-3 text-sm text-cream/80">
              <li className="flex items-center justify-center space-x-3 hover:text-sage transition-colors duration-300 cursor-default">
                <div className="p-1 bg-sage/20 rounded-lg">
                  <Star size={12} className="text-sage" />
                </div>
                <span className="font-medium">Client Management</span>
              </li>
              <li className="flex items-center justify-center space-x-3 hover:text-sage transition-colors duration-300 cursor-default">
                <div className="p-1 bg-sage/20 rounded-lg">
                  <Star size={12} className="text-sage" />
                </div>
                <span className="font-medium">Smart Billing System</span>
              </li>
              <li className="flex items-center justify-center space-x-3 hover:text-sage transition-colors duration-300 cursor-default">
                <div className="p-1 bg-sage/20 rounded-lg">
                  <Star size={12} className="text-sage" />
                </div>
                <span className="font-medium">Buffalo Care Tracker</span>
              </li>
              <li className="flex items-center justify-center space-x-3 hover:text-sage transition-colors duration-300 cursor-default">
                <div className="p-1 bg-sage/20 rounded-lg">
                  <Star size={12} className="text-sage" />
                </div>
                <span className="font-medium">Analytics Dashboard</span>
              </li>
            </ul>
          </div>

          {/* Technology Stack Section */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <h4 className="text-lg font-black text-cream">Built With</h4>
              <Coffee size={16} className="text-sage animate-pulse" />
            </div>
            <div className="space-y-3 text-sm text-cream/80">
              <div className="flex items-center justify-center space-x-3 hover:text-sage transition-colors duration-300 cursor-default">
                <div className="p-1 bg-sage/20 rounded-lg">
                  <Star size={12} className="text-sage" />
                </div>
                <span className="font-medium">Next.js 15 & TypeScript</span>
              </div>
              <div className="flex items-center justify-center space-x-3 hover:text-sage transition-colors duration-300 cursor-default">
                <div className="p-1 bg-sage/20 rounded-lg">
                  <Zap size={12} className="text-sage" />
                </div>
                <span className="font-medium">Tailwind CSS & Firebase</span>
              </div>
              <div className="flex items-center justify-center space-x-3 hover:text-sage transition-colors duration-300 cursor-default">
                <div className="p-1 bg-sage/20 rounded-lg">
                  <Globe size={12} className="text-sage" />
                </div>
                <span className="font-medium">Progressive Web App</span>
              </div>
              <div className="flex items-center justify-center space-x-3 hover:text-sage transition-colors duration-300 cursor-default">
                <div className="p-1 bg-sage/20 rounded-lg">
                  <Rocket size={12} className="text-sage" />
                </div>
                <span className="font-medium">Real-time Database</span>
              </div>
            </div>
          </div>

          {/* Developer & Project Info */}
          <div className="text-center md:text-right">
            <div className="flex items-center justify-center md:justify-end space-x-2 mb-4">
              <h4 className="text-lg font-black text-cream">Developer</h4>
              <Award size={16} className="text-sage animate-pulse" />
            </div>
            <div className="space-y-3 text-sm text-cream/80">
              <div className="flex items-center justify-center md:justify-end space-x-3 hover:text-sage transition-colors duration-300 cursor-default">
                <div className="p-1 bg-sage/20 rounded-lg">
                  <User size={12} className="text-sage" />
                </div>
                <span className="font-medium">Sumit Ghugare</span>
              </div>
              <div className="flex items-center justify-center md:justify-end space-x-3 hover:text-sage transition-colors duration-300 cursor-pointer">
                <div className="p-1 bg-sage/20 rounded-lg">
                  <Github size={12} className="text-sage" />
                </div>
                <span className="font-medium">@sumitghugare1</span>
              </div>
              <div className="flex items-center justify-center md:justify-end space-x-3 hover:text-sage transition-colors duration-300 cursor-default">
                <div className="p-1 bg-sage/20 rounded-lg">
                  <Calendar size={12} className="text-sage" />
                </div>
                <span className="font-medium">Developed in 2025</span>
              </div>
              <div className="flex items-center justify-center md:justify-end space-x-3 hover:text-sage transition-colors duration-300 cursor-default">
                <div className="p-1 bg-sage/20 rounded-lg">
                  <Heart size={12} className="text-sage" />
                </div>
                <span className="font-medium">Made with ❤️ in India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Bottom Section */}
        <div className="mt-8 pt-6 border-t border-sage/30">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Crown size={14} className="text-sage animate-pulse" />
              <p className="text-cream/70 text-sm font-semibold">
                © 2025 Ksheera. Empowering dairy businesses across India.
              </p>
              <Crown size={14} className="text-sage animate-pulse delay-500" />
            </div>
            <div className="flex items-center space-x-4 text-xs text-cream/60">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-sage rounded-full animate-pulse"></div>
                <span className="font-medium">Version 1.0.0</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-2">
                <Heart size={12} className="text-sage animate-pulse" />
                <span className="font-medium">Crafted for dairy excellence</span>
              </div>
            </div>
          </div>
          
          {/* Additional Developer Credits */}
          <div className="mt-4 pt-4 border-t border-sage/20">
            <div className="text-center">
              <p className="text-cream/60 text-xs font-medium">
                A comprehensive dairy management solution designed to streamline operations, 
                enhance productivity, and empower dairy farmers with modern technology.
              </p>
              <div className="flex items-center justify-center space-x-4 mt-2">
                <div className="flex items-center space-x-1">
                  <Rocket size={10} className="text-sage" />
                  <span className="text-xs text-cream/50">Built with modern React ecosystem</span>
                </div>
                <span className="text-cream/30">•</span>
                <div className="flex items-center space-x-1">
                  <Globe size={10} className="text-sage" />
                  <span className="text-xs text-cream/50">Responsive & Mobile-First</span>
                </div>
                <span className="text-cream/30">•</span>
                <div className="flex items-center space-x-1">
                  <Shield size={10} className="text-sage" />
                  <span className="text-xs text-cream/50">Secure & Scalable</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 left-8 w-1 h-1 bg-sage rounded-full animate-ping delay-100"></div>
        <div className="absolute top-16 right-16 w-1 h-1 bg-cream rounded-full animate-ping delay-300"></div>
        <div className="absolute bottom-8 left-1/4 w-1 h-1 bg-sage rounded-full animate-ping delay-500"></div>
        <div className="absolute bottom-16 right-1/3 w-1 h-1 bg-cream rounded-full animate-ping delay-700"></div>
        <div className="absolute top-1/3 left-16 w-0.5 h-0.5 bg-sage rounded-full animate-ping delay-1000"></div>
        <div className="absolute bottom-1/3 right-8 w-0.5 h-0.5 bg-cream rounded-full animate-ping delay-1200"></div>
      </div>
    </footer>
  );
}
