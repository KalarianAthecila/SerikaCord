// Server features for SerikaCord
export const SERVER_FEATURES = {
  // Partner & Verified
  PARTNERED: {
    id: 'PARTNERED',
    name: 'Partnered',
    description: 'Official Serika partner server',
    icon: 'handshake',
    color: '#5865F2',
    requirements: {
      minMembers: 100,
      verified: true,
    },
  },
  VERIFIED: {
    id: 'VERIFIED',
    name: 'Verified',
    description: 'Verified community server',
    icon: 'badge-check',
    color: '#5865F2',
  },
  DISCOVERABLE: {
    id: 'DISCOVERABLE',
    name: 'Discoverable',
    description: 'Server appears in Server Discovery',
    icon: 'compass',
    color: '#23A55A',
    requirements: {
      minMembers: 100,
    },
  },
  
  // Community Features
  COMMUNITY: {
    id: 'COMMUNITY',
    name: 'Community Server',
    description: 'Community features enabled',
    icon: 'users',
    color: '#5865F2',
  },
  WELCOME_SCREEN_ENABLED: {
    id: 'WELCOME_SCREEN_ENABLED',
    name: 'Welcome Screen',
    description: 'Custom welcome screen enabled',
    icon: 'sparkles',
    color: '#EB459E',
  },
  
  // Media Features
  ANIMATED_ICON: {
    id: 'ANIMATED_ICON',
    name: 'Animated Server Icon',
    description: 'Server can have an animated icon',
    icon: 'image',
    color: '#F47FFF',
  },
  BANNER: {
    id: 'BANNER',
    name: 'Server Banner',
    description: 'Server can have a banner image',
    icon: 'image',
    color: '#F47FFF',
  },
  ANIMATED_BANNER: {
    id: 'ANIMATED_BANNER',
    name: 'Animated Banner',
    description: 'Server can have an animated banner',
    icon: 'film',
    color: '#F47FFF',
  },
  
  // Invite Features
  VANITY_URL: {
    id: 'VANITY_URL',
    name: 'Vanity URL',
    description: 'Server has a custom invite link',
    icon: 'link',
    color: '#5865F2',
    requirements: {
      minMembers: 100,
      partnerOrDiscoverable: true,
    },
  },
  INVITE_SPLASH: {
    id: 'INVITE_SPLASH',
    name: 'Invite Splash',
    description: 'Custom invite splash background',
    icon: 'image',
    color: '#EB459E',
  },
  
  // Premium Features
  MORE_EMOJI: {
    id: 'MORE_EMOJI',
    name: 'More Emoji Slots',
    description: 'Increased emoji limit',
    icon: 'smile',
    color: '#FEE75C',
  },
  MORE_STICKERS: {
    id: 'MORE_STICKERS',
    name: 'More Sticker Slots',
    description: 'Increased sticker limit',
    icon: 'sticker',
    color: '#FEE75C',
  },
  HIGH_QUALITY_AUDIO: {
    id: 'HIGH_QUALITY_AUDIO',
    name: 'High Quality Audio',
    description: '384kbps audio quality',
    icon: 'music',
    color: '#57F287',
  },
} as const;

export type ServerFeatureId = keyof typeof SERVER_FEATURES;
export type ServerFeature = typeof SERVER_FEATURES[ServerFeatureId];

export const getServerFeatures = (featureIds: string[]): ServerFeature[] => {
  return featureIds
    .map(id => SERVER_FEATURES[id as ServerFeatureId])
    .filter(Boolean);
};

// Premium tier features
export const PREMIUM_TIERS = {
  0: {
    name: 'No Level',
    emoji: 500,
    stickers: 500,
    audioQuality: 96,
    uploadLimit: 500,
    streamQuality: '720p 30fps',
  },
  1: {
    name: 'Level 1',
    emoji: 500,
    stickers: 500,
    audioQuality: 128,
    uploadLimit: 500,
    streamQuality: '720p 60fps',
    features: ['ANIMATED_ICON'],
  },
  2: {
    name: 'Level 2',
    emoji: 500,
    stickers: 500,
    audioQuality: 256,
    uploadLimit: 2000,
    streamQuality: '1080p 60fps',
    features: ['ANIMATED_ICON', 'BANNER', 'INVITE_SPLASH'],
  },
  3: {
    name: 'Level 3',
    emoji: 500,
    stickers: 500,
    audioQuality: 384,
    uploadLimit: 2000,
    streamQuality: '4K 60fps',
    features: ['ANIMATED_ICON', 'BANNER', 'ANIMATED_BANNER', 'INVITE_SPLASH', 'VANITY_URL'],
  },
} as const;
