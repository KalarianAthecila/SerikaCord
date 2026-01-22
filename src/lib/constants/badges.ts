// Badge system for SerikaCord
export const BADGES = {
  // Staff Badges
  STAFF: {
    id: 'staff',
    name: 'Serika Staff',
    description: 'Official Serika staff member',
    icon: 'shield-check',
    color: '#5865F2',
    priority: 100,
  },
  ADMIN: {
    id: 'admin',
    name: 'Administrator',
    description: 'Platform administrator',
    icon: 'shield',
    color: '#ED4245',
    priority: 99,
  },
  MODERATOR: {
    id: 'moderator',
    name: 'Moderator',
    description: 'Platform moderator',
    icon: 'shield-half',
    color: '#FEE75C',
    priority: 98,
  },
  
  // Partner & Premium
  PARTNER: {
    id: 'partner',
    name: 'Partnered Server Owner',
    description: 'Owner of a partnered server',
    icon: 'handshake',
    color: '#5865F2',
    priority: 90,
  },
  SERIKA_PLUS: {
    id: 'serika_plus',
    name: 'Serika+',
    description: 'Serika+ subscriber',
    icon: 'sparkles',
    color: '#F47FFF',
    priority: 85,
  },
  EARLY_SUPPORTER: {
    id: 'early_supporter',
    name: 'Early Supporter',
    description: 'Supported Serika in its early days',
    icon: 'heart',
    color: '#EB459E',
    priority: 80,
  },
  
  // Achievement Badges
  VERIFIED_BOT_DEVELOPER: {
    id: 'verified_bot_developer',
    name: 'Verified Bot Developer',
    description: 'Developer of a verified bot',
    icon: 'bot',
    color: '#57F287',
    priority: 70,
  },
  BUG_HUNTER: {
    id: 'bug_hunter',
    name: 'Bug Hunter',
    description: 'Found and reported critical bugs',
    icon: 'bug',
    color: '#57F287',
    priority: 65,
  },
  BUG_HUNTER_GOLD: {
    id: 'bug_hunter_gold',
    name: 'Bug Hunter (Gold)',
    description: 'Elite bug hunter',
    icon: 'bug',
    color: '#FFD700',
    priority: 66,
  },
  
  // Server Badges
  SERVER_OWNER: {
    id: 'server_owner',
    name: 'Server Owner',
    description: 'Owns at least one server',
    icon: 'crown',
    color: '#FFD700',
    priority: 50,
  },
  ACTIVE_DEVELOPER: {
    id: 'active_developer',
    name: 'Active Developer',
    description: 'Active application developer',
    icon: 'code',
    color: '#23A55A',
    priority: 55,
  },
  
  // Special Event Badges
  HYPESQUAD_BRAVERY: {
    id: 'hypesquad_bravery',
    name: 'HypeSquad Bravery',
    description: 'Member of HypeSquad Bravery',
    icon: 'zap',
    color: '#9C84EF',
    priority: 40,
  },
  HYPESQUAD_BRILLIANCE: {
    id: 'hypesquad_brilliance',
    name: 'HypeSquad Brilliance',
    description: 'Member of HypeSquad Brilliance',
    icon: 'flame',
    color: '#F47B67',
    priority: 40,
  },
  HYPESQUAD_BALANCE: {
    id: 'hypesquad_balance',
    name: 'HypeSquad Balance',
    description: 'Member of HypeSquad Balance',
    icon: 'scale',
    color: '#45DDC0',
    priority: 40,
  },
} as const;

// BadgeKey is the uppercase key like 'STAFF'
export type BadgeKey = keyof typeof BADGES;
// BadgeId is the lowercase id like 'staff'
export type BadgeId = typeof BADGES[BadgeKey]['id'];
export type Badge = typeof BADGES[BadgeKey];

export const getBadgesByPriority = (badgeIds: BadgeId[]): Badge[] => {
  const badgeMap = Object.values(BADGES).reduce((acc, badge) => {
    acc[badge.id] = badge;
    return acc;
  }, {} as Record<string, Badge>);
  
  return badgeIds
    .map(id => badgeMap[id])
    .filter(Boolean)
    .sort((a, b) => b.priority - a.priority);
};
