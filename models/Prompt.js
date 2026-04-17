const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    minlength: [3, 'Title must be at least 3 characters long'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
    unique: true,
    index: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [10, 'Description must be at least 10 characters long'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  promptText: {
    type: String,
    required: [true, 'Prompt text is required'],
    minlength: [20, 'Prompt text must be at least 20 characters long'],
    trim: true,
    maxlength: [5000, 'Prompt text cannot exceed 5000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    enum: {
      values: ['marketing', 'coding', 'writing', 'business', 'education'],
      message: 'Category must be one of: marketing, coding, writing, business, education'
    }
  },
  tags: {
    type: [String],
    validate: {
      validator: function(tags) {
        return tags.length <= 10;
      },
      message: 'Tags array cannot have more than 10 items'
    },
    default: [],
    index: true
  },
  usageCount: {
    type: Number,
    default: 0,
    min: [0, 'Usage count cannot be negative']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better search performance
promptSchema.index({ title: 'text', description: 'text', promptText: 'text' });
promptSchema.index({ category: 1 });
promptSchema.index({ tags: 1 });
promptSchema.index({ usageCount: -1 });
promptSchema.index({ createdAt: -1 });

// Compound indexes for common query patterns
promptSchema.index({ category: 1, usageCount: -1 });
promptSchema.index({ tags: 1, createdAt: -1 });
promptSchema.index({ category: 1, createdAt: -1 });

// Virtual for formatted creation date
promptSchema.virtual('createdAtFormatted').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
});

// Pre-save middleware to trim tags and remove empty tags
promptSchema.pre('save', function(next) {
  if (this.tags && Array.isArray(this.tags)) {
    this.tags = this.tags
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  }
  next();
});

// Static method to get popular prompts
promptSchema.statics.getPopular = function(limit = 10) {
  return this.find()
    .sort({ usageCount: -1 })
    .limit(limit);
};

// Static method to search prompts
promptSchema.statics.search = function(query, filters = {}) {
  const searchQuery = {};
  
  if (query) {
    searchQuery.$or = [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { promptText: { $regex: query, $options: 'i' } }
    ];
  }
  
  if (filters.category) {
    searchQuery.category = filters.category;
  }
  
  if (filters.tags && filters.tags.length > 0) {
    searchQuery.tags = { $in: filters.tags };
  }
  
  return this.find(searchQuery);
};

module.exports = mongoose.model('Prompt', promptSchema);
