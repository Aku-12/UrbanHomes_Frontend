import { CheckCircle, Target, Heart, Eye } from 'lucide-react';
import { Header, Footer } from '../components/layout';

const AboutPage = () => {
  const missionVisionPromise = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To empower the room-hunting process and connect landlords with tenants in a transparent and hassle-free manner that results in trust and respect.'
    },
    {
      icon: Eye,
      title: 'Our Vision',
      description: 'To become the most trusted platform where landlords and renters connect effortlessly, making room hunting safe and stress-free for all.'
    },
    {
      icon: Heart,
      title: 'Our Promise',
      description: 'Every room listing, every service, every tenant - we are dedicated to ensuring transparency and making fair housing a right and a reality.'
    }
  ];

  const storyPoints = [
    'Every room carefully verified by our team',
    'Transparent pricing with no hidden fees',
    '24/7 customer support for all users'
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <div className="pt-20 pb-16 px-0 sm:px-0 lg:px-2">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div className="px-4 sm:px-4 lg:px-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Making Room Hunting <span className="text-green-500">Simple</span> and Stress-Free
              </h1>
              <p className="text-gray-600 text-lg mb-8">
                Urban Homes was founded with a simple mission: to help people find their perfect living space without the usual headaches. We believe everyone deserves a place they can truly call home.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-3xl font-bold text-green-500">25+</p>
                  <p className="text-gray-600 text-sm">Partnerships</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-500">1K+</p>
                  <p className="text-gray-600 text-sm">Happy Renters</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-500">4+</p>
                  <p className="text-gray-600 text-sm">Cities Covered</p>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="px-4 sm:px-4 lg:px-6">
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <img
                  src="https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Modern house"
                  className="w-full h-80 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission, Vision, Promise Section */}
      <div className="py-16 bg-gray-50 px-0 sm:px-0 lg:px-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {missionVisionPromise.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="bg-white rounded-lg p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Icon className="text-green-500" size={24} />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="py-16 px-0 sm:px-0 lg:px-2">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left - Story Images */}
            <div className="px-4 sm:px-4 lg:px-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg overflow-hidden shadow-md">
                  <img
                    src="https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=300"
                    alt="Room 1"
                    className="w-full h-64 object-cover"
                  />
                </div>
                <div className="rounded-lg overflow-hidden shadow-md">
                  <img
                    src="https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=300"
                    alt="Room 2"
                    className="w-full h-64 object-cover"
                  />
                </div>
                <div className="rounded-lg overflow-hidden shadow-md col-span-2">
                  <img
                    src="https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=600"
                    alt="Room 3"
                    className="w-full h-64 object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Right - Story Text */}
            <div className="px-4 sm:px-4 lg:px-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Our <span className="text-green-500">Story</span>
              </h2>
              <p className="text-gray-600 mb-6">
                Urban Homes started in 2024 when our founder experienced firsthand the frustrations of finding quality rental-room listings. Endless searching, misleading listings, and complicated processes led to the creation of Urban Homes - a dedicated platform designed to simplify the entire room-hunting experience.
              </p>
              <p className="text-gray-600 mb-8">
                What began as a small initiative has grown into a trusted platform serving thousands. Our commitment to verified listings and transparent processes has made us the go-to choice for renters and landlords alike.
              </p>

              <div className="space-y-3">
                {storyPoints.map((point, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="text-green-500 mt-1 flex-shrink-0" size={20} />
                    <p className="text-gray-700">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team/Values Section */}
      <div className="py-16 bg-gray-50 px-0 sm:px-0 lg:px-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Urban Homes?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're committed to making your room hunting journey easy, transparent, and reliable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Verified Listings',
                description: 'Every room is thoroughly verified to ensure accuracy and authenticity'
              },
              {
                title: 'Secure Booking',
                description: 'Our secure payment system protects both renters and landlords'
              },
              {
                title: '24/7 Support',
                description: 'Our dedicated team is always ready to help you with any concerns'
              },
              {
                title: 'Transparent Pricing',
                description: 'No hidden fees - see exactly what you\'re paying for'
              },
              {
                title: 'Easy Comparison',
                description: 'Compare rooms side-by-side and save your favorites'
              },
              {
                title: 'Community Trust',
                description: 'Join thousands of happy renters who found their perfect room'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutPage;
