import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import urbanLogo from '../../assets/urbanlogo.svg';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Company: [
      { name: 'About Us', path: '/about' },
      { name: 'Careers', path: '/careers' },
      { name: 'Press', path: '/press' },
      { name: 'Blog', path: '/blog' },
    ],
    Support: [
      { name: 'Help Center', path: '/help' },
      { name: 'Safety', path: '/safety' },
      { name: 'Contact Us', path: '/contact' },
      { name: 'FAQ', path: '/faq' },
    ],
    Hosting: [
      { name: 'List Your Room', path: '/list-room' },
      { name: 'Host Resources', path: '/host-resources' },
      { name: 'Community', path: '/community' },
      { name: 'Guidelines', path: '/guidelines' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'Twitter' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <img src={urbanLogo} alt="Urban Homes" className="h-12 w-auto brightness-0 invert mb-3" />
            <p className="text-xs text-gray-400 mb-3 max-w-xs">
              Making room hunting simple and stress-free. Find your perfect space with ease and confidence.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                >
                  <social.icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white text-sm font-semibold mb-3">{title}</h4>
              <ul className="space-y-1.5">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400">
              &copy; {currentYear} Urban Homes. All rights reserved.
            </p>
            <div className="flex space-x-5">
              <Link to="/privacy" className="text-xs text-gray-400 hover:text-white">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-xs text-gray-400 hover:text-white">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
