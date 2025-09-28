import React, { useState, useEffect } from 'react';
import { 
  TreePine, 
  Recycle, 
  Droplets, 
  Camera, 
  MapPin, 
  Calendar, 
  Users, 
  Award, 
  CheckCircle,
  Clock,
  Target,
  Upload,
  Star,
  Leaf,
  TrendingUp,
  Share2
} from 'lucide-react';
import toast from 'react-hot-toast';

const RealWorldChallenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [userChallenges, setUserChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showSubmission, setShowSubmission] = useState(false);
  const [submission, setSubmission] = useState({
    photos: [],
    description: '',
    location: '',
    participants: 1
  });

  // Challenge categories with different types
  const challengeTypes = {
    'tree-plantation': {
      name: 'Tree Plantation',
      icon: TreePine,
      color: 'green',
      points: 100,
      description: 'Plant trees to combat climate change'
    },
    'waste-cleanup': {
      name: 'Waste Cleanup',
      icon: Recycle,
      color: 'blue',
      points: 80,
      description: 'Clean up plastic waste from environment'
    },
    'water-conservation': {
      name: 'Water Conservation',
      icon: Droplets,
      color: 'cyan',
      points: 60,
      description: 'Implement water saving techniques'
    },
    'energy-saving': {
      name: 'Energy Saving',
      icon: Leaf,
      color: 'yellow',
      points: 70,
      description: 'Reduce energy consumption'
    }
  };

  // Mock challenges data
  useEffect(() => {
    const mockChallenges = [
      {
        id: 1,
        title: "Plant 10 Trees Challenge",
        description: "Organize a tree plantation drive in your community. Plant at least 10 saplings and document the process.",
        type: "tree-plantation",
        difficulty: "Medium",
        duration: "1-2 weeks",
        points: 150,
        participants: 234,
        completions: 89,
        requirements: [
          "Plant minimum 10 tree saplings",
          "Document with before/after photos",
          "Get permission from local authorities if needed",
          "Involve at least 5 community members"
        ],
        tips: [
          "Choose native tree species for better survival",
          "Plant during monsoon season for best results",
          "Ensure proper spacing between trees",
          "Plan for ongoing care and maintenance"
        ],
        impact: "Trees planted through this challenge have absorbed approximately 2.3 tons of CO2",
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        isActive: true
      },
      {
        id: 2,
        title: "Beach/Park Cleanup Drive",
        description: "Organize a cleanup drive at a local beach, park, or public space. Remove plastic waste and document your impact.",
        type: "waste-cleanup",
        difficulty: "Easy",
        duration: "1 day",
        points: 100,
        participants: 567,
        completions: 312,
        requirements: [
          "Clean minimum 500 sq meters area",
          "Sort and weigh collected waste",
          "Take before/after photos",
          "Involve minimum 3 participants"
        ],
        tips: [
          "Bring gloves and safety equipment",
          "Separate recyclable and non-recyclable waste",
          "Contact local waste management for disposal",
          "Share your impact on social media"
        ],
        impact: "Over 1.2 tons of waste removed from environment",
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        isActive: true
      },
      {
        id: 3,
        title: "Rainwater Harvesting Setup",
        description: "Install a rainwater harvesting system in your home, school, or community building.",
        type: "water-conservation",
        difficulty: "Hard",
        duration: "2-4 weeks",
        points: 200,
        participants: 89,
        completions: 23,
        requirements: [
          "Install functional rainwater harvesting system",
          "Calculate potential water savings",
          "Document installation process",
          "Monitor water collection for 1 month"
        ],
        tips: [
          "Calculate roof area and expected rainfall",
          "Use first-flush diverters for better quality",
          "Install proper filtration systems",
          "Regular maintenance is crucial"
        ],
        impact: "Systems installed save average 500L water per month",
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month from now
        isActive: true
      }
    ];
    
    setChallenges(mockChallenges);
    
    // Mock user's ongoing challenges
    const mockUserChallenges = [
      {
        id: 1,
        challengeId: 1,
        status: 'in-progress',
        progress: 60,
        startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        submissions: [
          {
            id: 1,
            photos: ['tree1.jpg', 'tree2.jpg'],
            description: 'Planted 6 mango trees in the school compound',
            location: 'St. Mary\'s School, Hyderabad',
            participants: 12,
            submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            status: 'approved',
            points: 90
          }
        ]
      }
    ];
    
    setUserChallenges(mockUserChallenges);
  }, []);

  const handleJoinChallenge = (challenge) => {
    const userChallenge = {
      id: userChallenges.length + 1,
      challengeId: challenge.id,
      status: 'in-progress',
      progress: 0,
      startedAt: new Date(),
      submissions: []
    };
    
    setUserChallenges([...userChallenges, userChallenge]);
    toast.success(`Joined "${challenge.title}" challenge!`);
  };

  const handleFileUpload = (files) => {
    const fileArray = Array.from(files);
    if (fileArray.length > 5) {
      toast.error('Maximum 5 photos allowed');
      return;
    }
    
    setSubmission({
      ...submission,
      photos: fileArray.map(file => URL.createObjectURL(file))
    });
  };

  const handleSubmitEvidence = () => {
    if (!submission.description.trim() || submission.photos.length === 0) {
      toast.error('Please add photos and description');
      return;
    }

    const newSubmission = {
      id: Date.now(),
      photos: submission.photos,
      description: submission.description,
      location: submission.location,
      participants: submission.participants,
      submittedAt: new Date(),
      status: 'pending',
      points: selectedChallenge.points
    };

    // Update user challenge
    setUserChallenges(prev => prev.map(uc => 
      uc.challengeId === selectedChallenge.id
        ? {
            ...uc,
            submissions: [...uc.submissions, newSubmission],
            progress: Math.min(100, uc.progress + 40)
          }
        : uc
    ));

    setSubmission({ photos: [], description: '', location: '', participants: 1 });
    setShowSubmission(false);
    toast.success('Evidence submitted! It will be reviewed soon.');
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTimeLeft = (deadline) => {
    const now = new Date();
    const diffMs = deadline - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) return `${diffDays} days left`;
    return 'Deadline passed';
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center mb-4">
          <Target className="mr-3 text-green-600" size={32} />
          Real World Eco Challenges
        </h1>
        <p className="text-gray-600">Take action in the real world and make a tangible impact on the environment!</p>
      </div>

      {/* My Active Challenges */}
      {userChallenges.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">My Active Challenges</h2>
          <div className="grid gap-6">
            {userChallenges.map(userChallenge => {
              const challenge = challenges.find(c => c.id === userChallenge.challengeId);
              if (!challenge) return null;
              
              const challengeType = challengeTypes[challenge.type];
              const Icon = challengeType.icon;
              
              return (
                <div key={userChallenge.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 bg-${challengeType.color}-100 rounded-lg`}>
                        <Icon className={`text-${challengeType.color}-600`} size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{challenge.title}</h3>
                        <p className="text-gray-600 text-sm">Started {userChallenge.startedAt.toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedChallenge(challenge);
                        setShowSubmission(true);
                      }}
                      className="btn-primary flex items-center"
                    >
                      <Camera className="mr-2" size={16} />
                      Submit Evidence
                    </button>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{userChallenge.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${userChallenge.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Submissions */}
                  {userChallenge.submissions.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Recent Submissions</h4>
                      <div className="space-y-2">
                        {userChallenge.submissions.map(submission => (
                          <div key={submission.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="flex -space-x-2">
                                {submission.photos.slice(0, 3).map((photo, index) => (
                                  <div key={index} className="w-8 h-8 bg-green-200 rounded border-2 border-white flex items-center justify-center">
                                    <Camera size={12} className="text-green-600" />
                                  </div>
                                ))}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-800">{submission.description}</p>
                                <p className="text-xs text-gray-500">{submission.submittedAt.toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                                submission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {submission.status}
                              </span>
                              {submission.status === 'approved' && (
                                <span className="text-green-600 font-medium text-sm">+{submission.points} pts</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Challenges */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Challenges</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map(challenge => {
            const challengeType = challengeTypes[challenge.type];
            const Icon = challengeType.icon;
            const isJoined = userChallenges.some(uc => uc.challengeId === challenge.id);
            
            return (
              <div key={challenge.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Challenge Header */}
                <div className={`bg-${challengeType.color}-500 text-white p-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <Icon size={24} />
                    <span className="text-sm font-medium">+{challenge.points} points</span>
                  </div>
                  <h3 className="text-lg font-semibold">{challenge.title}</h3>
                  <p className="text-sm opacity-90 mt-1">{challengeType.description}</p>
                </div>
                
                {/* Challenge Content */}
                <div className="p-4">
                  <p className="text-gray-600 text-sm mb-4">{challenge.description}</p>
                  
                  {/* Challenge Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                        {challenge.difficulty}
                      </div>
                    </div>
                    <div className="text-center">
                      <Clock size={16} className="mx-auto text-gray-400 mb-1" />
                      <p className="text-xs text-gray-600">{challenge.duration}</p>
                    </div>
                    <div className="text-center">
                      <Users size={16} className="mx-auto text-gray-400 mb-1" />
                      <p className="text-xs text-gray-600">{challenge.participants}</p>
                    </div>
                  </div>
                  
                  {/* Deadline */}
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <Calendar size={14} className="mr-1" />
                    {getTimeLeft(challenge.deadline)}
                  </div>
                  
                  {/* Requirements Preview */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 text-sm mb-2">Requirements:</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {challenge.requirements.slice(0, 2).map((req, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle size={12} className="mr-1 mt-0.5 text-green-500" />
                          {req}
                        </li>
                      ))}
                      {challenge.requirements.length > 2 && (
                        <li className="text-gray-400">+{challenge.requirements.length - 2} more...</li>
                      )}
                    </ul>
                  </div>
                  
                  {/* Action Button */}
                  <button
                    onClick={() => isJoined ? null : handleJoinChallenge(challenge)}
                    disabled={isJoined}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      isJoined 
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                        : `bg-${challengeType.color}-600 hover:bg-${challengeType.color}-700 text-white`
                    }`}
                  >
                    {isJoined ? 'Challenge Joined' : 'Join Challenge'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Evidence Submission Modal */}
      {showSubmission && selectedChallenge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-green-600 text-white p-6">
              <h2 className="text-xl font-bold">Submit Evidence</h2>
              <p className="text-green-100">{selectedChallenge.title}</p>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-6">
                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photos (Required)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                      <p className="text-gray-600">Click to upload photos</p>
                      <p className="text-sm text-gray-400">Maximum 5 photos, JPG/PNG</p>
                    </label>
                  </div>
                  
                  {/* Photo Preview */}
                  {submission.photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {submission.photos.map((photo, index) => (
                        <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img 
                            src={photo} 
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Required)
                  </label>
                  <textarea
                    value={submission.description}
                    onChange={(e) => setSubmission({...submission, description: e.target.value})}
                    placeholder="Describe what you did, how you did it, and the impact made..."
                    rows="4"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none resize-none"
                  />
                </div>
                
                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={submission.location}
                      onChange={(e) => setSubmission({...submission, location: e.target.value})}
                      placeholder="Where did this take place?"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                    />
                  </div>
                </div>
                
                {/* Participants */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Participants
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={submission.participants}
                    onChange={(e) => setSubmission({...submission, participants: parseInt(e.target.value) || 1})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
            
            <div className="border-t p-6">
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowSubmission(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitEvidence}
                  className="flex-1 btn-primary flex items-center justify-center"
                >
                  <CheckCircle className="mr-2" size={16} />
                  Submit Evidence
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealWorldChallenges;