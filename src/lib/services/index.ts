export { storage, type UploadCategory } from './storage';
export { 
  // Auth utilities
  hashPassword,
  verifyPassword,
  generateSessionId,
  generateToken,
  createTokenPair,
  verifyToken,
  createSession,
  getSession,
  deleteSession,
  deleteAllUserSessions,
  authenticateRequest,
  refreshAccessToken,
  // User management
  registerUser,
  verifyEmail,
  login,
  requestPasswordReset,
  resetPassword,
  invalidateUserCache,
  // OAuth
  handleDiscordOAuth,
} from './auth';
