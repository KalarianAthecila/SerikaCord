import mongoose, { Schema, Document, Types } from 'mongoose';

export type ExperimentType = 
  | 'feature_flag'      // Simple on/off feature flags
  | 'ab_test'           // A/B testing with multiple variants
  | 'percentage_rollout' // Gradual percentage-based rollout
  | 'user_segment';     // Specific user segments

export type ExperimentStatus = 'draft' | 'running' | 'paused' | 'completed' | 'archived';

export interface IExperimentVariant {
  id: string;
  name: string;
  description?: string;
  weight: number; // Percentage weight for this variant (0-100)
  config: Record<string, unknown>; // Variant-specific configuration
}

export interface IExperimentFilter {
  type: 'user_id' | 'badge' | 'premium' | 'staff' | 'account_age' | 'server_count' | 'custom';
  operator: 'equals' | 'not_equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'not_in';
  value: unknown;
}

export interface IExperimentMetrics {
  impressions: number;
  conversions: number;
  conversionRate: number;
  variantMetrics: Record<string, {
    impressions: number;
    conversions: number;
    conversionRate: number;
  }>;
}

export interface IExperiment extends Document {
  _id: Types.ObjectId;
  
  // Identification
  name: string;
  key: string; // Unique identifier used in code (e.g., 'new_emoji_picker')
  description?: string;
  
  // Type & Status
  type: ExperimentType;
  status: ExperimentStatus;
  
  // Targeting
  rolloutPercentage: number; // 0-100
  variants: IExperimentVariant[];
  filters: IExperimentFilter[];
  
  // User Assignments (for consistent experience)
  // Stored as hash buckets for efficient lookup
  userBuckets: Map<string, string>; // userId -> variantId
  
  // Specific user overrides
  userOverrides: {
    userId: Types.ObjectId;
    variantId: string;
  }[];
  
  // Excluded users
  excludedUsers: Types.ObjectId[];
  
  // Metrics
  metrics: IExperimentMetrics;
  
  // Audit
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  startedAt?: Date;
  endedAt?: Date;
  
  // Instance targeting (for multi-instance support)
  targetInstances: string[]; // Empty = all instances, or specific instance IDs
  
  createdAt: Date;
  updatedAt: Date;
}

const ExperimentVariantSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  weight: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0,
  },
  config: {
    type: Schema.Types.Mixed,
    default: {},
  },
}, { _id: false });

const ExperimentFilterSchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ['user_id', 'badge', 'premium', 'staff', 'account_age', 'server_count', 'custom'],
  },
  operator: {
    type: String,
    required: true,
    enum: ['equals', 'not_equals', 'contains', 'gt', 'lt', 'gte', 'lte', 'in', 'not_in'],
  },
  value: {
    type: Schema.Types.Mixed,
    required: true,
  },
}, { _id: false });

const ExperimentSchema = new Schema<IExperiment>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[a-z0-9_]+$/,
    maxlength: 50,
  },
  description: {
    type: String,
    maxlength: 500,
  },
  type: {
    type: String,
    required: true,
    enum: ['feature_flag', 'ab_test', 'percentage_rollout', 'user_segment'],
    default: 'feature_flag',
  },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'running', 'paused', 'completed', 'archived'],
    default: 'draft',
  },
  rolloutPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0,
  },
  variants: {
    type: [ExperimentVariantSchema],
    default: [],
  },
  filters: {
    type: [ExperimentFilterSchema],
    default: [],
  },
  userBuckets: {
    type: Map,
    of: String,
    default: new Map(),
  },
  userOverrides: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    variantId: {
      type: String,
      required: true,
    },
  }],
  excludedUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  metrics: {
    impressions: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    variantMetrics: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  startedAt: Date,
  endedAt: Date,
  targetInstances: {
    type: [String],
    default: [],
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
// Note: key already has unique:true which creates an index
ExperimentSchema.index({ status: 1 });
ExperimentSchema.index({ type: 1 });
ExperimentSchema.index({ 'userOverrides.userId': 1 });
ExperimentSchema.index({ createdAt: -1 });

export const Experiment = mongoose.models.Experiment || mongoose.model<IExperiment>('Experiment', ExperimentSchema);

// Helper function to determine variant for a user
export function getUserVariant(
  experiment: IExperiment,
  userId: string,
  userAttributes?: Record<string, unknown>
): { inExperiment: boolean; variant: IExperimentVariant | null } {
  // Check if experiment is running
  if (experiment.status !== 'running') {
    return { inExperiment: false, variant: null };
  }

  // Check excluded users
  if (experiment.excludedUsers.some(id => id.toString() === userId)) {
    return { inExperiment: false, variant: null };
  }

  // Check user overrides first
  const override = experiment.userOverrides.find(o => o.userId.toString() === userId);
  if (override) {
    const variant = experiment.variants.find(v => v.id === override.variantId);
    return { inExperiment: true, variant: variant || null };
  }

  // Apply filters
  if (experiment.filters.length > 0 && userAttributes) {
    const passesFilters = experiment.filters.every(filter => {
      const attrValue = userAttributes[filter.type];
      switch (filter.operator) {
        case 'equals':
          return attrValue === filter.value;
        case 'not_equals':
          return attrValue !== filter.value;
        case 'contains':
          return String(attrValue).includes(String(filter.value));
        case 'gt':
          return Number(attrValue) > Number(filter.value);
        case 'lt':
          return Number(attrValue) < Number(filter.value);
        case 'gte':
          return Number(attrValue) >= Number(filter.value);
        case 'lte':
          return Number(attrValue) <= Number(filter.value);
        case 'in':
          return Array.isArray(filter.value) && filter.value.includes(attrValue);
        case 'not_in':
          return Array.isArray(filter.value) && !filter.value.includes(attrValue);
        default:
          return true;
      }
    });
    
    if (!passesFilters) {
      return { inExperiment: false, variant: null };
    }
  }

  // Check if user is in rollout percentage using consistent hashing
  const hash = hashUserId(userId, experiment.key);
  const bucket = hash % 100;
  
  if (bucket >= experiment.rolloutPercentage) {
    return { inExperiment: false, variant: null };
  }

  // Assign variant based on weights
  if (experiment.variants.length === 0) {
    // Feature flag - just return that user is in experiment
    return { inExperiment: true, variant: null };
  }

  // Calculate cumulative weights
  let cumulativeWeight = 0;
  const variantBucket = hash % 100;
  
  for (const variant of experiment.variants) {
    cumulativeWeight += variant.weight;
    if (variantBucket < cumulativeWeight) {
      return { inExperiment: true, variant };
    }
  }

  // Fallback to first variant
  return { inExperiment: true, variant: experiment.variants[0] || null };
}

// Consistent hash function for user bucketing
function hashUserId(userId: string, experimentKey: string): number {
  const str = `${userId}:${experimentKey}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}
