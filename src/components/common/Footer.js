import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Phone, Mail, Bike } from "lucide-react";
import { getUser } from '../../api/auth';

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="relative z-[100] w-full bg-gray-900 text-gray-300">
      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Bike className="text-blue-500" size={28} />
            <h2 className="text-2xl font-bold text-white">
              BikeService
            </h2>
          </div>
          <p className="text-sm leading-relaxed">
            Your trusted bike service center for washing, modification,
            EV services, spare parts, and second-hand bikes.
          </p>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Services
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                to="/services"
                state={{ selectedService: 'washing' }}
                className="hover:text-white transition-colors"
              >
                Bike Washing
              </Link>
            </li>
            <li>
              <Link
                to="/services"
                state={{ selectedService: 'modifications' }}
                className="hover:text-white transition-colors"
              >
                Bike Modification
              </Link>
            </li>
            <li>
              <Link
                to="/services"
                state={{ selectedService: 'evservice' }}
                className="hover:text-white transition-colors"
              >
                EV Service
              </Link>
            </li>
            <li>
              <Link
                to="/services"
                state={{ selectedService: 'parts' }}
                className="hover:text-white transition-colors"
              >
                Spare Parts
              </Link>
            </li>
            <li>
              <Link
                to="/services"
                state={{ selectedService: 'secondhand' }}
                className="hover:text-white transition-colors"
              >
                Second Hand Bikes
              </Link>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Quick Links
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                to="/"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hover:text-white transition-colors"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/login"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hover:text-white transition-colors"
              >
                Login
              </Link>
            </li>
            <li>
              <Link
                to="/register"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hover:text-white transition-colors"
              >
                Register
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hover:text-white transition-colors"
              >
                My Profile
              </Link>
            </li>
            <li>
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  const user = getUser();
                  if (user) navigate('/book-service');
                  else navigate('/login');
                }}
                className="hover:text-white transition-colors"
              >
                Book Service
              </button>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Contact Us
          </h3>
          <ul className="space-y-4 text-sm w-80">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="text-blue-500 shrink-0 mt-0.5" />
              <span>Kolkata, India</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={18} className="text-blue-500 shrink-0" />
              <span>+91 8240429417</span>
            </li>
            <li className="flex items-start gap-3">
              <Mail size={18} className="text-blue-500 shrink-0 mt-0.5" />
              {/* Added break-all for mobile and adjusted text size to ensure single line on tablet/desktop */}
              <span className="break-all text-[13px] sm:text-sm">
                maataratwowheelerservicecenter@gmail.com
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-800 py-6 text-center text-x tracking-widest uppercase font-medium">
        © {new Date().getFullYear()} BikeService Center. Made by {" "}
        <a
          href="https://github.com/black-operators"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#3B82F6] hover:text-white transition-colors"
        >
          Black Operators
        </a>
        .
      </div>
    </footer>
  );
};

export default Footer;