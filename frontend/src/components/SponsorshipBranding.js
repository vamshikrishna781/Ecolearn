import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Building, 
  Star, 
  ExternalLink, 
  Gift, 
  Target,
  Users,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

const SponsorshipBranding = () => {
  const [sponsors, setSponsors] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    // Mock data - in production, this would come from API
    const mockSponsors = [
      {
        id: 1,
        name: 'EcoTech Industries',
        logo: null,
        tier: 'platinum',
        description: 'Leading sustainable technology solutions',
        website: 'https://ecotech.com',
        established: 2018,
        focus: ['Solar Energy', 'Water Purification', 'Waste Management'],
        color: '#10B981'
      },
      {
        id: 2,
        name: 'Green Future Foundation',
        logo: null,
        tier: 'gold',
        description: 'Non-profit organization promoting environmental education',
        website: 'https://greenfuture.org',
        established: 2015,
        focus: ['Education', 'Tree Plantation', 'Climate Action'],
        color: '#F59E0B'
      },
      {
        id: 3,
        name: 'Sustainable Solutions Corp',
        logo: null,
        tier: 'silver',
        description: 'Corporate sustainability consulting and implementation',
        website: 'https://sustainablesolutions.com',
        established: 2020,
        focus: ['Corporate Training', 'Carbon Footprint', 'Green Infrastructure'],
        color: '#6B7280'
      }
    ];

    const mockCampaigns = [
      {
        id: 1,
        sponsor: 'EcoTech Industries',
        title: 'Solar Schools Initiative',
        description: 'Install solar panels in 100 schools across India',
        goal: 'Install solar systems in participating schools',
        reward: '₹10,000 scholarship + Solar kit',
        participants: 245,
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        requirements: [
          'Identify suitable school location',
          'Get principal approval',
          'Conduct energy audit',
          'Submit installation proposal'
        ],
        status: 'active',
        progress: 68
      },
      {
        id: 2,
        sponsor: 'Green Future Foundation',
        title: 'Million Trees Challenge',
        description: 'Plant 1 million trees across urban areas',
        goal: 'Plant minimum 50 trees in your community',
        reward: 'Tree Planter Certificate + ₹5,000',
        participants: 1250,
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        requirements: [
          'Register plantation site',
          'Plant 50+ native tree saplings',
          'Document with photos',
          'Ensure 3-month survival rate'
        ],
        status: 'active',
        progress: 42
      },
      {
        id: 3,
        sponsor: 'Sustainable Solutions Corp',
        title: 'Campus Carbon Neutral',
        description: 'Make educational institutions carbon neutral',
        goal: 'Reduce campus carbon footprint by 30%',
        reward: 'Sustainability Internship + ₹15,000',
        participants: 89,
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        requirements: [
          'Conduct carbon audit',
          'Implement reduction strategies',
          'Monitor for 6 months',
          'Submit impact report'
        ],
        status: 'active',
        progress: 23
      }
    ];

    const mockAchievements = [
      {
        id: 1,
        title: 'EcoTech Champion',
        description: 'Completed 5 EcoTech sponsored challenges',
        icon: '🏆',
        sponsor: 'EcoTech Industries',
        earned: true,
        progress: 5,
        total: 5
      },
      {
        id: 2,
        title: 'Green Ambassador',
        description: 'Planted 100+ trees through Foundation campaigns',
        icon: '🌳',
        sponsor: 'Green Future Foundation',
        earned: false,
        progress: 73,
        total: 100
      },
      {
        id: 3,
        title: 'Sustainability Expert',
        description: 'Achieved carbon neutral status in 3 projects',
        icon: '⚡',
        sponsor: 'Sustainable Solutions Corp',
        earned: false,
        progress: 1,
        total: 3
      }
    ];

    setSponsors(mockSponsors);
    setCampaigns(mockCampaigns);
    setAchievements(mockAchievements);
  }, []);

  const getTierColor = (tier) => {
    switch (tier) {
      case 'platinum': return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
      case 'gold': return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 'silver': return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800';
      default: return 'bg-gradient-to-r from-green-400 to-green-600 text-white';
    }
  };

  const getTimeLeft = (endDate) => {
    const now = new Date();
    const diffMs = endDate - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays > 30) return `${Math.floor(diffDays / 30)} months left`;
    if (diffDays > 0) return `${diffDays} days left`;
    return 'Ending soon';
  };

  const handleJoinCampaign = (campaignId) => {
    toast.success('Campaign joined! Check your dashboard for requirements.');
  };

  const handleLearnMore = (website) => {
    window.open(website, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center mb-4">
          <Building className="mr-3 text-green-600" size={32} />
          Sponsorship & Partners
        </h1>
        <p className="text-gray-600">
          Join sponsored campaigns by leading environmental organizations and earn exclusive rewards!
        </p>
      </div>

      {/* Sponsor Achievements */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Sponsor Achievements</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {achievements.map(achievement => (
            <div 
              key={achievement.id} 
              className={`p-6 rounded-lg border-2 ${
                achievement.earned 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">{achievement.icon}</div>
                {achievement.earned && <Award className="text-green-600" size={24} />}
              </div>
              
              <h3 className="font-semibold text-gray-800 mb-2">{achievement.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
              <p className="text-xs text-gray-500 mb-3">Sponsored by {achievement.sponsor}</p>
              
              {!achievement.earned && (
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{achievement.progress}/{achievement.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Active Campaigns */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Active Sponsored Campaigns</h2>
        <div className="grid gap-6">
          {campaigns.map(campaign => (
            <div key={campaign.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              {/* Campaign Header */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center mb-2">
                      <Building className="mr-2" size={20} />
                      <span className="text-sm opacity-90">{campaign.sponsor}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{campaign.title}</h3>
                    <p className="opacity-90">{campaign.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="bg-white bg-opacity-20 rounded-lg p-3">
                      <Gift size={24} />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Campaign Content */}
              <div className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Campaign Details */}
                  <div className="md:col-span-2">
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Campaign Goal:</h4>
                      <p className="text-gray-600">{campaign.goal}</p>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Requirements:</h4>
                      <ul className="space-y-1">
                        {campaign.requirements.map((req, index) => (
                          <li key={index} className="flex items-start text-sm text-gray-600">
                            <Target size={12} className="mr-2 mt-1 text-green-600 flex-shrink-0" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Campaign Progress */}
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Global Progress</span>
                        <span>{campaign.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${campaign.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Campaign Stats */}
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-center">
                        <Gift className="mx-auto mb-2 text-green-600" size={24} />
                        <h4 className="font-semibold text-gray-800">Reward</h4>
                        <p className="text-sm text-gray-600 mt-1">{campaign.reward}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Users className="mx-auto mb-1 text-gray-600" size={18} />
                        <p className="text-sm text-gray-600">Participants</p>
                        <p className="font-semibold text-gray-800">{campaign.participants}</p>
                      </div>
                      
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Calendar className="mx-auto mb-1 text-gray-600" size={18} />
                        <p className="text-sm text-gray-600">Time Left</p>
                        <p className="font-semibold text-gray-800 text-xs">{getTimeLeft(campaign.endDate)}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleJoinCampaign(campaign.id)}
                      className="w-full btn-primary"
                    >
                      Join Campaign
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Our Sponsors */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Our Sponsors</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {sponsors.map(sponsor => (
            <div key={sponsor.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              {/* Sponsor Header */}
              <div className={`p-4 ${getTierColor(sponsor.tier)}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Building size={24} />
                  </div>
                  <span className="text-xs px-2 py-1 bg-white bg-opacity-20 rounded-full uppercase tracking-wider">
                    {sponsor.tier}
                  </span>
                </div>
                <h3 className="text-lg font-bold">{sponsor.name}</h3>
                <p className="text-sm opacity-90">Est. {sponsor.established}</p>
              </div>
              
              {/* Sponsor Content */}
              <div className="p-4">
                <p className="text-gray-600 text-sm mb-4">{sponsor.description}</p>
                
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 text-sm mb-2">Focus Areas:</h4>
                  <div className="flex flex-wrap gap-2">
                    {sponsor.focus.map((area, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="mr-1" size={14} />
                    <span>Trusted Partner</span>
                  </div>
                  <button
                    onClick={() => handleLearnMore(sponsor.website)}
                    className="flex items-center text-green-600 hover:text-green-700 text-sm"
                  >
                    <span>Learn More</span>
                    <ExternalLink className="ml-1" size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sponsor Call to Action */}
      <div className="mt-12 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-8 text-center">
        <Building className="mx-auto mb-4" size={48} />
        <h2 className="text-2xl font-bold mb-4">Interested in Sponsoring?</h2>
        <p className="mb-6 opacity-90">
          Partner with EcoLearn to promote environmental awareness and sustainability education among young minds.
        </p>
        <button className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
          Become a Sponsor
        </button>
      </div>
    </div>
  );
};

export default SponsorshipBranding;