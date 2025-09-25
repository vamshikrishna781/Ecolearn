const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user's game progress
router.get('/progress', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('gameProgress ecoPoints level badges');
    res.json(user);
  } catch (error) {
    console.error('Get game progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update game progress
router.post('/progress', auth, async (req, res) => {
  try {
    const { challengeId, pointsEarned, newChapter } = req.body;
    
    const user = await User.findById(req.user._id);
    
    // Add points
    if (pointsEarned) {
      await user.addEcoPoints(pointsEarned);
    }
    
    // Update challenge completion
    if (challengeId) {
      const existingChallenge = user.gameProgress.completedChallenges
        .find(c => c.challengeId === challengeId);
      
      if (!existingChallenge) {
        user.gameProgress.completedChallenges.push({
          challengeId,
          completedAt: new Date(),
          pointsEarned: pointsEarned || 0
        });
      }
    }
    
    // Update chapter
    if (newChapter && newChapter > user.gameProgress.currentChapter) {
      user.gameProgress.currentChapter = newChapter;
    }
    
    await user.save();
    
    res.json({
      message: 'Progress updated successfully',
      ecoPoints: user.ecoPoints,
      level: user.level,
      gameProgress: user.gameProgress
    });
  } catch (error) {
    console.error('Update game progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Award badge
router.post('/badge', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const user = await User.findById(req.user._id);
    
    // Check if badge already exists
    const existingBadge = user.badges.find(b => b.name === name);
    if (existingBadge) {
      return res.status(400).json({ message: 'Badge already earned' });
    }
    
    user.badges.push({ name, description });
    await user.save();
    
    res.json({
      message: 'Badge earned!',
      badge: { name, description },
      totalBadges: user.badges.length
    });
  } catch (error) {
    console.error('Award badge error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get game challenges/storyline
router.get('/challenges', auth, async (req, res) => {
  try {
    // In a real app, this would come from a database
    const challenges = [
      {
        id: 'chapter1_intro',
        chapter: 1,
        title: 'The Asteroid Strike',
        description: 'Learn about the catastrophic event that changed everything.',
        points: 100,
        type: 'story'
      },
      {
        id: 'chapter1_quiz1',
        chapter: 1,
        title: 'Species Extinction Quiz',
        description: 'Test your knowledge about extinct species.',
        points: 150,
        type: 'quiz'
      },
      {
        id: 'chapter2_treeplant',
        chapter: 2,
        title: 'Tree Planting Challenge',
        description: 'Plant a tree and upload photo evidence.',
        points: 300,
        type: 'real-world'
      },
      {
        id: 'chapter2_waste',
        chapter: 2,
        title: 'Waste Segregation',
        description: 'Properly segregate waste for a week.',
        points: 200,
        type: 'real-world'
      },
      {
        id: 'chapter3_ecosystem',
        chapter: 3,
        title: 'Rebuild the Ecosystem',
        description: 'Learn how humans can restore damaged ecosystems.',
        points: 250,
        type: 'interactive'
      }
    ];
    
    res.json(challenges);
  } catch (error) {
    console.error('Get challenges error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get storyline content
router.get('/storyline/:chapter', auth, async (req, res) => {
  try {
    const chapter = parseInt(req.params.chapter);
    
    const storylines = {
      1: {
        title: "The Great Disruption",
        content: "A massive asteroid has struck Earth, causing widespread environmental destruction. Many species have gone extinct, and the survivors must learn to adapt and rebuild while protecting what remains of the ecosystem.",
        objectives: [
          "Understand the impact of sudden environmental changes",
          "Learn about species adaptation and survival",
          "Identify key factors for ecosystem recovery"
        ],
        nextChapter: 2
      },
      2: {
        title: "The Human Response",
        content: "Humans have survived the catastrophe but face the challenge of rebuilding civilization while being mindful of their impact on the recovering environment. Every decision matters for long-term sustainability.",
        objectives: [
          "Learn sustainable living practices",
          "Understand human impact on ecosystems",
          "Take real-world environmental actions"
        ],
        nextChapter: 3
      },
      3: {
        title: "Rebuilding Together",
        content: "The key to survival is recognizing that humans are part of the ecosystem, not separate from it. True progress means thriving together with nature, not at its expense.",
        objectives: [
          "Design sustainable communities",
          "Balance economic growth with environmental protection",
          "Create positive environmental change"
        ],
        nextChapter: null
      }
    };
    
    const storyline = storylines[chapter];
    if (!storyline) {
      return res.status(404).json({ message: 'Chapter not found' });
    }
    
    res.json(storyline);
  } catch (error) {
    console.error('Get storyline error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;