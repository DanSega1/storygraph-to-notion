const mongoose = require('mongoose');

// Node schema
const nodeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  }
}, { timestamps: true });

// Edge schema
const edgeSchema = new mongoose.Schema({
  source: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Node',
    required: true
  },
  target: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Node',
    required: true
  },
  label: {
    type: String,
    default: ''
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

// Story schema
const storySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startNode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Node'
  },
  nodes: [nodeSchema],
  edges: [edgeSchema],
  isPublished: {
    type: Boolean,
    default: false
  },
  tags: {
    type: [String],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('Story', storySchema);
