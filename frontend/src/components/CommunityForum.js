import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  ThumbsUp, 
  Reply, 
  Send, 
  Search, 
  Filter,
  TreePine,
  Recycle,
  Droplets,
  Wind,
  Users,
  Award,
  Clock,
  MessageCircle,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';

const CommunityForum = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general' });
  const [showNewPost, setShowNewPost] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const categories = {
    general: { name: 'General Discussion', icon: MessageSquare, color: 'blue' },
    'tree-plantation': { name: 'Tree Plantation', icon: TreePine, color: 'green' },
    recycling: { name: 'Recycling & Waste', icon: Recycle, color: 'emerald' },
    'water-conservation': { name: 'Water Conservation', icon: Droplets, color: 'cyan' },
    'air-quality': { name: 'Air Quality', icon: Wind, color: 'sky' },
    'eco-challenges': { name: 'Eco Challenges', icon: Award, color: 'yellow' }
  };

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockPosts = [
      {
        id: 1,
        title: "Successfully planted 50 trees in our school!",
        content: "Our eco-club organized a tree plantation drive last weekend. We managed to plant 50 saplings around the school campus. The response from students was amazing!",
        author: "EcoWarrior123",
        avatar: null,
        category: "tree-plantation",
        likes: 24,
        replies: 8,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isLiked: false,
        badges: ["Tree Planter", "Eco Champion"]
      },
      {
        id: 2,
        title: "Tips for reducing plastic waste at home",
        content: "Here are some practical ways I've reduced plastic usage: 1) Use cloth bags for shopping, 2) Buy in bulk to reduce packaging, 3) Choose glass containers over plastic. What other tips do you have?",
        author: "GreenLiving",
        avatar: null,
        category: "recycling",
        likes: 18,
        replies: 12,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        isLiked: true,
        badges: ["Waste Warrior"]
      },
      {
        id: 3,
        title: "Water conservation challenge results",
        content: "Update on our 30-day water conservation challenge! Our school reduced water consumption by 25%. Here's what worked best for us...",
        author: "AquaDefender",
        avatar: null,
        category: "water-conservation",
        likes: 31,
        replies: 6,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        isLiked: false,
        badges: ["Water Saver", "Challenge Master"]
      }
    ];
    setPosts(mockPosts);
  }, []);

  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const post = {
      id: posts.length + 1,
      title: newPost.title,
      content: newPost.content,
      author: "You", // In real app, get from auth context
      avatar: null,
      category: newPost.category,
      likes: 0,
      replies: 0,
      createdAt: new Date(),
      isLiked: false,
      badges: ["New Member"]
    };

    setPosts([post, ...posts]);
    setNewPost({ title: '', content: '', category: 'general' });
    setShowNewPost(false);
    toast.success('Post created successfully!');
  };

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !post.isLiked 
          }
        : post
    ));
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'popular':
        return (b.likes + b.replies) - (a.likes + a.replies);
      default:
        return 0;
    }
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <Users className="mr-3 text-green-600" size={32} />
              EcoLearn Community
            </h1>
            <p className="text-gray-600 mt-2">Share experiences, ask questions, and connect with fellow eco-warriors!</p>
          </div>
          <button
            onClick={() => setShowNewPost(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="mr-2" size={18} />
            New Post
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:border-green-600 focus:outline-none"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {Object.entries(categories).map(([key, category]) => (
              <option key={key} value={key}>{category.name}</option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Categories Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {Object.entries(categories).map(([key, category]) => {
          const Icon = category.icon;
          return (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedCategory === key
                  ? `border-${category.color}-500 bg-${category.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Icon className={`mx-auto mb-2 text-${category.color}-600`} size={24} />
              <span className="text-sm font-medium text-center block">
                {category.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* New Post Modal */}
      {showNewPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-green-600 text-white p-6">
              <h2 className="text-xl font-bold">Create New Post</h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                  >
                    {Object.entries(categories).map(([key, category]) => (
                      <option key={key} value={key}>{category.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                    placeholder="What's your post about?"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                    placeholder="Share your thoughts, experiences, or questions..."
                    rows="6"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none resize-none"
                  />
                </div>
              </div>
              
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => setShowNewPost(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePost}
                  className="flex-1 btn-primary flex items-center justify-center"
                >
                  <Send className="mr-2" size={16} />
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-6">
        {sortedPosts.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-500 text-lg">No posts found</p>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          sortedPosts.map((post) => {
            const categoryInfo = categories[post.category];
            const CategoryIcon = categoryInfo.icon;
            
            return (
              <div key={post.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                      {post.author.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-800">{post.author}</h3>
                        {post.badges.map((badge, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Clock size={14} className="mr-1" />
                        {getTimeAgo(post.createdAt)}
                        <span className="mx-2">•</span>
                        <CategoryIcon size={14} className={`mr-1 text-${categoryInfo.color}-600`} />
                        {categoryInfo.name}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">{post.title}</h2>
                  <p className="text-gray-600 leading-relaxed">{post.content}</p>
                </div>

                {/* Post Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center space-x-2 transition-colors ${
                        post.isLiked ? 'text-green-600' : 'text-gray-500 hover:text-green-600'
                      }`}
                    >
                      <ThumbsUp size={18} className={post.isLiked ? 'fill-current' : ''} />
                      <span>{post.likes}</span>
                    </button>
                    
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors">
                      <MessageCircle size={18} />
                      <span>{post.replies}</span>
                    </button>
                    
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-green-600 transition-colors">
                      <Reply size={18} />
                      <span>Reply</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CommunityForum;