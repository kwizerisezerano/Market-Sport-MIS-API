import { Link } from 'react-router-dom'
import {
  Store,
  MapPin,
  CreditCard,
  BarChart3,
  Bell,
  Shield,
  Zap,
  Users,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  Smartphone
} from 'lucide-react'

const Home = () => {
  const features = [
    {
      icon: MapPin,
      title: 'Zone & Space Management',
      description: 'Real-time tracking and management of market zones and spaces with instant availability updates.',
      color: 'bg-blue-500'
    },
    {
      icon: Users,
      title: 'Seller Registration',
      description: 'Streamlined digital onboarding process with automated space allocation for new sellers.',
      color: 'bg-green-500'
    },
    {
      icon: CreditCard,
      title: 'Integrated Payment System',
      description: 'Secure mobile money and digital payment options with instant receipts and automated reconciliation.',
      color: 'bg-purple-500'
    },
    {
      icon: BarChart3,
      title: 'Comprehensive Reporting',
      description: 'Automated daily, weekly, and monthly reports with analytics for better decision-making.',
      color: 'bg-orange-500'
    },
    {
      icon: Bell,
      title: 'Automated Notifications',
      description: 'Instant notifications for payments, allocations, and important announcements.',
      color: 'bg-pink-500'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with role-based access control and data protection.',
      color: 'bg-red-500'
    },
  ]

  const benefits = [
    {
      icon: Zap,
      title: 'Faster Operations',
      description: 'Reduce administrative overhead through automation of routine processes.'
    },
    {
      icon: TrendingUp,
      title: 'Better Revenue',
      description: 'Improve revenue collection via secure and trackable payment systems.'
    },
    {
      icon: Clock,
      title: 'Time Saving',
      description: 'Faster and more transparent seller onboarding process.'
    },
    {
      icon: Smartphone,
      title: 'Mobile Ready',
      description: 'Access your dashboard and manage operations from any device.'
    },
  ]

  const stats = [
    { number: '100%', label: 'Digital Transformation' },
    { number: '24/7', label: 'System Availability' },
    { number: '99.9%', label: 'Uptime Guarantee' },
    { number: '1000+', label: 'Active Users' },
  ]

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="bg-teal-600 w-10 h-10 rounded-lg flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-extrabold text-gray-900">MARKET SPOTON</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-gray-600 hover:text-gray-900 hidden sm:inline">Sign In</Link>
              <Link to="/register" className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      <header className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-blue-700 to-indigo-700">
        <div className="absolute inset-0 opacity-10" />
        <div className="max-w-7xl mx-auto px-4 py-24 lg:py-40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur border border-white/30 text-xs font-semibold">
                <CheckCircle className="w-4 h-4 mr-2" />
                Digital Market Management Platform
              </div>
              <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
                Transform Your Market <span className="block text-white/90">Operations Today</span>
              </h1>
              <p className="mt-5 text-white/90 max-w-xl">
                Streamline zone and space allocation, seller registration, payment processing, and reporting with our comprehensive, secure, and user-friendly digital market management system.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-teal-700 font-bold hover:bg-gray-100 shadow">
                  Get Started Free
                  <ArrowRight className="ml-2 w-6 h-6" />
                </Link>
                <Link to="/login" className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-white text-white hover:bg-white/10">Sign In</Link>
              </div>
            </div>
            <div className="relative">
             <img
  src="https://images.pexels.com/photos/29929118/pexels-photo-29929118.jpeg"
  alt="Modern shopping mall exterior"
  className="w-full rounded-3xl shadow-2xl object-cover h-[420px] lg:h-[520px]"
  loading="lazy"
/>
              <div className="absolute -bottom-6 -left-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 flex items-center gap-4">
                <div className="bg-teal-500 w-10 h-10 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">Instant Payments</div>
                  <div className="text-xs text-gray-600">Mobile money + receipts</div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 flex items-center gap-4">
                <div className="bg-blue-600 w-10 h-10 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">Secure Access</div>
                  <div className="text-xs text-gray-600">Role-based control</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow p-6 text-center">
                <div className="text-3xl font-extrabold text-gray-900">{stat.number}</div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900">Powerful Features for Modern Markets</h2>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your market efficiently, ensure compliance, and maximize revenue growth.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="bg-white p-6 rounded-xl shadow border border-gray-100 transition-transform hover:-translate-y-0.5">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${feature.color}`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900">Measurable Benefits of Going Digital</h2>
            <p className="mt-3 text-gray-600">Experience increased efficiency and clear returns on your investment.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div key={index} className="bg-white p-6 rounded-xl shadow border border-gray-100">
                  <div className="w-12 h-12 rounded-lg bg-teal-600 flex items-center justify-center">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-gray-900">{benefit.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{benefit.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900">In Action</h2>
            <p className="mt-3 text-gray-600">See how Market SpotOn looks and feels in real environments.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">


<img
  src="https://images.pexels.com/photos/33349008/pexels-photo-33349008.jpeg"
  alt="Interior of modern shopping mall"
  className="w-full rounded-3xl shadow-2xl object-cover h-[420px] lg:h-[520px]"
  loading="lazy"
/>

<img
  src="https://images.pexels.com/photos/29929118/pexels-photo-29929118.jpeg"
  alt="Modern shopping mall exterior"
  className="w-full rounded-3xl shadow-2xl object-cover h-[420px] lg:h-[520px]"
  loading="lazy"
/>
<img
  src="https://images.pexels.com/photos/33349008/pexels-photo-33349008.jpeg"
  alt="Interior of modern shopping mall"
  className="w-full rounded-3xl shadow-2xl object-cover h-[420px] lg:h-[520px]"
  loading="lazy"
/>

          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-teal-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-extrabold">Ready to Transform Your Market?</h2>
          <p className="mt-3 max-w-2xl mx-auto text-white/90">Join thousands of market managers and sellers who are already using Market SpotOn to digitize and grow.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white hover:bg-gray-100 text-teal-700 px-10 py-4 rounded-xl font-extrabold text-lg transition-all transform hover:scale-[1.02] shadow-xl">Start Free Trial</Link>
            <Link to="/login" className="px-10 py-4 rounded-xl border border-white text-white hover:bg-white/10 font-bold">Contact Sales</Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-10">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center mb-4">
                <div className="bg-teal-600 w-9 h-9 rounded-lg flex items-center justify-center mr-2">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-extrabold text-white">MARKET SPOTON</span>
              </Link>
              <p className="text-sm max-w-sm">The leading digital market management platform designed to streamline operations and boost efficiency for municipal and private markets.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Support Center</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© {new Date().getFullYear()} Market SpotOn System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home