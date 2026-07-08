import { User } from '@/lib/models/User';
import { connectDB } from '@/lib/db';

// Serika Broadcast system user ID - fixed UUID
export const SERIKA_BROADCAST_ID = '00000000-0000-0000-0000-000000000001';

export interface ISerikaBroadcast {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  isSystem: boolean;
  isBot: boolean;
  badges: string[];
}

export const SERIKA_BROADCAST_USER: ISerikaBroadcast = {
  id: SERIKA_BROADCAST_ID,
  username: 'serika',
  displayName: 'Serika',
  avatar: '/serika-avatar.png',
  isSystem: true,
  isBot: true,
  badges: ['staff', 'admin'],
};

/**
 * Ensure the Serika Broadcast system user exists in the database
 */
export async function ensureSerikaBroadcastUser(): Promise<void> {
  try {
    await connectDB();
    
    const existingUser = await User.findById(SERIKA_BROADCAST_ID);
    
    if (!existingUser) {
      try {
        await User.create({
          id: SERIKA_BROADCAST_ID,
          username: 'serika',
          displayName: 'Serika',
          avatar: '/serika-avatar.png',
          isSystem: true,
          isBot: true,
          isVerified: true,
          badges: ['staff', 'admin'],
          status: 'online',
          settings: {
            theme: 'dark',
            locale: 'en-US',
            notifications: {
              desktop: false,
              sounds: false,
              mentions: false,
            },
            privacy: {
              directMessages: 'friends',
              friendRequests: 'friends',
            },
          },
        });
        console.log('✅ Serika Broadcast system user created');
      } catch (createError: any) {
        if (createError.code === '23505') {
          console.log('ℹ️ Serika Broadcast user already exists');
        } else {
          throw createError;
        }
      }
    } else {
      const updateFields: Record<string, any> = {};
      if (existingUser.displayName !== 'Serika') {
        updateFields.displayName = 'Serika';
      }
      if (existingUser.username !== 'serika') {
        updateFields.username = 'serika';
      }
      if (!existingUser.isSystem) {
        updateFields.isSystem = true;
      }
      if (existingUser.avatar !== '/serika-avatar.png') {
        updateFields.avatar = '/serika-avatar.png';
      }
      if (Object.keys(updateFields).length > 0) {
        await User.updateById(existingUser.id, updateFields);
        console.log('✅ Serika Broadcast system user updated');
      }
    }
  } catch (error) {
    console.error('⚠️ Failed to ensure Serika Broadcast user:', error);
  }
}

/**
 * Get the Serika Broadcast user data for API responses
 */
export function getSerikaBroadcastUser(): ISerikaBroadcast {
  return SERIKA_BROADCAST_USER;
}

/**
 * Check if a user ID is the Serika Broadcast system user
 */
export function isSerikaBroadcast(userId: string): boolean {
  return userId === SERIKA_BROADCAST_ID;
}
