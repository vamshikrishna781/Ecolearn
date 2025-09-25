import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Leaf, 
  GamepadIcon, 
  Trophy, 
  Users, 
  BookOpen, 
  Target,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: GamepadIcon,
      title: 'Interactive Gaming',
      description: 'Learn through an engaging storyline where humanity rebuilds after an asteroid strike'
    },
    {
      icon: Trophy,
      title: 'Eco-Points & Badges',
      description: 'Earn points for sustainable actions and compete with schools nationwide'
    },
    {
      icon: Users,
      title: 'School Communities',
      description: 'Teachers create student accounts and track class progress together'
    },
    {
      icon: Target,
      title: 'Real-World Challenges',
      description: 'Tree planting, waste segregation, and other hands-on environmental activities'
    },
    {
      icon: BookOpen,
      title: 'Educational Content',
      description: 'Learn about climate change, ecosystems, and sustainable living'
    },
    {
      icon: CheckCircle,
      title: 'Progress Tracking',
      description: 'Monitor your environmental impact and learning achievements'
    }
  ];

  const benefits = [
    'Gamified learning increases retention by 70%',
    'Real-world challenges inspire action',
    'School-wide competitions motivate participation',
    'Aligned with NEP 2020 experiential learning goals',
    'Addresses SDG goals for environmental awareness'
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 game-bg opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-primary-500 rounded-full flex items-center justify-center float">
                <Leaf className="text-white" size={40} />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
              <span className="eco-text-gradient">Ecolearn</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform environmental education through interactive gaming. 
              Learn, act, and compete to build a sustainable future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn-primary text-lg px-8 py-3 inline-flex items-center"
              >
                Start Your Eco-Journey
                <ArrowRight className="ml-2" size={20} />
              </Link>
              <Link
                to="/login"
                className="btn-secondary text-lg px-8 py-3"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              The Story That Drives Change
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience a world where an asteroid strike has disrupted ecosystems. 
              As a survivor, learn how humans can rebuild civilization while 
              protecting and restoring the environment.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">☄️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">The Disruption</h3>
              <p className="text-gray-600">
                An asteroid strike causes massive environmental destruction. 
                Species go extinct and ecosystems collapse.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏗️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">The Rebuild</h3>
              <p className="text-gray-600">
                Survivors must rebuild civilization while making sustainable 
                choices that protect the recovering environment.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🌱</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">The Revival</h3>
              <p className="text-gray-600">
                Learn that humans are part of the ecosystem. True progress 
                means thriving together with nature.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Ecolearn?
            </h2>
            <p className="text-xl text-gray-600">
              Innovative features designed to make environmental education engaging and effective
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="card p-6 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="text-green-600" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Proven Impact on Learning
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our gamified approach to environmental education delivers 
                measurable results in student engagement and knowledge retention.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="text-green-500 mr-3 mt-0.5" size={20} />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-green-400 to-primary-500 rounded-lg flex items-center justify-center">
                <div className="text-white text-center">
                  <GamepadIcon size={64} className="mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Interactive Learning</h3>
                  <p className="text-lg opacity-90">Engage, Learn, Act, Repeat</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 eco-gradient">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Save the Planet?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of students already making a difference through Ecolearn
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-green-700 font-semibold px-8 py-3 rounded-md hover:bg-green-50 transition-colors inline-flex items-center justify-center"
            >
              Get Started Free
              <ArrowRight className="ml-2" size={20} />
            </Link>
            <Link
              to="/login"
              className="border-2 border-white text-white font-semibold px-8 py-3 rounded-md hover:bg-white hover:text-green-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
          
          <p className="text-green-100 text-sm mt-4">
            Free for all students, teachers, and schools
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-primary-500 rounded-full flex items-center justify-center mr-3">
              <Leaf className="text-white" size={20} />
            </div>
            <span className="text-2xl font-bold">Ecolearn</span>
          </div>
          
          <p className="text-center text-gray-400 mb-4">
            Empowering the next generation of environmental stewards through interactive education
          </p>
          
          <p className="text-center text-sm text-gray-500">
            © 2025 Ecolearn. Built for a sustainable future. 🌱
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;