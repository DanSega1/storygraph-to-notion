const express = require('express');
const router = express.Router();
const Story = require('../models/storyModel');
const { authenticate } = require('../middleware/authMiddleware');

// Get all public stories
router.get('/public', async (req, res) => {
  try {
    const stories = await Story.find({ isPublished: true })
      .populate('author', 'username')
      .select('-nodes -edges');
    
    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get story by ID
router.get('/:id', async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate('author', 'username');
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    res.json(story);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new story
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description } = req.body;
    
    const story = new Story({
      title,
      description,
      author: req.user.id
    });

    const savedStory = await story.save();
    res.status(201).json(savedStory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add a node to a story
router.post('/:id/nodes', authenticate, async (req, res) => {
  try {
    const { title, content, position } = req.body;
    
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    
    // Check ownership
    if (story.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const newNode = {
      title,
      content,
      position
    };
    
    story.nodes.push(newNode);
    
    // If this is the first node, set it as the start node
    if (story.nodes.length === 1) {
      story.startNode = story.nodes[0]._id;
    }
    
    await story.save();
    
    res.status(201).json(story.nodes[story.nodes.length - 1]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add an edge to a story
router.post('/:id/edges', authenticate, async (req, res) => {
  try {
    const { source, target, label } = req.body;
    
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    
    // Check ownership
    if (story.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const newEdge = {
      source,
      target,
      label
    };
    
    story.edges.push(newEdge);
    await story.save();
    
    res.status(201).json(story.edges[story.edges.length - 1]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a story
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { title, description, isPublished, tags } = req.body;
    
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    
    // Check ownership
    if (story.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (title) story.title = title;
    if (description) story.description = description;
    if (isPublished !== undefined) story.isPublished = isPublished;
    if (tags) story.tags = tags;
    
    const updatedStory = await story.save();
    res.json(updatedStory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a story
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    
    // Check ownership
    if (story.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await story.remove();
    res.json({ message: 'Story deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
