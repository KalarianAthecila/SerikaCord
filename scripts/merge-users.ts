#!/usr/bin/env bun
/**
 * Merge two SerikaCord users into one.
 *
 * Defaults:
 *   target: username "serika" (the account you want to keep)
 *   source: email "saki@schoolsquid.xyz" (the account to merge into target)
 *
 * Usage (dry run):
 *   bun run scripts/merge-users.ts
 *
 * Usage (execute):
 *   bun run scripts/merge-users.ts --execute
 *
 * The target user's username/ID and profile are preserved. The source user's email
 * is moved to the target. Any data owned by the source is transferred to the target.
 */

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:3233/serikacord';
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'serikacord';

const TARGET_USERNAME = 'serika';
const SOURCE_EMAIL = 'saki@schoolsquid.xyz';

const EXECUTE = process.argv.includes('--execute');

function toObjectId(value: string | mongoose.Types.ObjectId): mongoose.Types.ObjectId {
  return typeof value === 'string' ? new mongoose.Types.ObjectId(value) : value;
}

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI, { dbName: MONGO_DB_NAME });
  console.log('Connected!');

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database not connected');
  }

  const usersCollection = db.collection('users');
  const target = await usersCollection.findOne({ username: TARGET_USERNAME });
  const source = await usersCollection.findOne({ email: SOURCE_EMAIL.toLowerCase() });

  console.log('\nTarget user (will be kept):');
  if (target) {
    console.log(`  _id:    ${target._id}`);
    console.log(`  username: ${target.username}`);
    console.log(`  displayName: ${target.displayName || '(none)'}`);
    console.log(`  email:  ${target.email || '(none)'}`);
  } else {
    console.log('  NOT FOUND');
  }

  console.log('\nSource user (will be merged into target):');
  if (source) {
    console.log(`  _id:    ${source._id}`);
    console.log(`  username: ${source.username}`);
    console.log(`  displayName: ${source.displayName || '(none)'}`);
    console.log(`  email:  ${source.email || '(none)'}`);
  } else {
    console.log('  NOT FOUND');
  }

  if (!target || !source) {
    console.log('\nCannot merge: both users must exist.');
    await mongoose.disconnect();
    return;
  }

  if (target._id.toString() === source._id.toString()) {
    console.log('\nBoth identifiers point to the same user. Nothing to merge.');
    await mongoose.disconnect();
    return;
  }

  const targetId = toObjectId(target._id);
  const sourceId = toObjectId(source._id);

  // Count data owned by the source so the user can see what will move.
  const stats: Record<string, number> = {};
  const count = async (collectionName: string, filter: object) => {
    stats[collectionName] = await db.collection(collectionName).countDocuments(filter);
  };

  await count('servers', { owner: sourceId });
  await count('servermembers', { userId: sourceId });
  await count('channels', { participants: sourceId });
  await count('messages', { author: sourceId });
  await count('userconnections', { userId: sourceId });
  await count('userdevicesessions', { userId: sourceId });
  await count('authorizedapps', { userId: sourceId });
  await count('applications', { ownerId: sourceId });
  await count('developerteams', { $or: [{ ownerId: sourceId }, { members: sourceId }] });
  await count('richpresences', { userId: sourceId });
  await count('serverbans', { userId: sourceId });
  await count('invites', { createdBy: sourceId });
  await count('adminlogs', { $or: [{ adminId: sourceId }, { targetUserId: sourceId }] });

  console.log('\nData owned by source user:');
  for (const [name, value] of Object.entries(stats)) {
    console.log(`  ${name}: ${value}`);
  }

  if (!EXECUTE) {
    console.log('\nThis was a dry run. No changes were made.');
    console.log('Run with --execute to perform the merge.');
    await mongoose.disconnect();
    return;
  }

  console.log('\nExecuting merge...');

  // 1. Transfer server ownership.
  await db.collection('servers').updateMany({ owner: sourceId }, { $set: { owner: targetId } });

  // 2. Merge server memberships. If both users are in the same server, keep the target's membership.
  const sourceMemberships = await db.collection('servermembers').find({ userId: sourceId }).toArray();
  for (const membership of sourceMemberships) {
    const existing = await db.collection('servermembers').findOne({ userId: targetId, serverId: membership.serverId });
    if (existing) {
      await db.collection('servermembers').deleteOne({ _id: membership._id });
    } else {
      await db.collection('servermembers').updateOne({ _id: membership._id }, { $set: { userId: targetId } });
    }
  }

  // 3. Replace source user in DM channels.
  await db.collection('channels').updateMany(
    { participants: sourceId },
    { $set: { 'participants.$[elem]': targetId } },
    { arrayFilters: [{ elem: sourceId }] }
  );
  // Remove duplicate target entries in participants.
  await db.collection('channels').updateMany(
    { participants: targetId },
    { $addToSet: { participants: targetId } }
  );

  // 4. Update message authors.
  await db.collection('messages').updateMany({ author: sourceId }, { $set: { author: targetId } });

  // 5. Transfer user connections.
  await db.collection('userconnections').updateMany({ userId: sourceId }, { $set: { userId: targetId } });

  // 6. Delete source device sessions.
  await db.collection('userdevicesessions').deleteMany({ userId: sourceId });

  // 7. Transfer authorized apps, applications, developer teams.
  await db.collection('authorizedapps').updateMany({ userId: sourceId }, { $set: { userId: targetId } });
  await db.collection('applications').updateMany({ ownerId: sourceId }, { $set: { ownerId: targetId } });
  await db.collection('developerteams').updateMany({ ownerId: sourceId }, { $set: { ownerId: targetId } });
  await db.collection('developerteams').updateMany({ members: sourceId }, { $set: { 'members.$[elem]': targetId } }, { arrayFilters: [{ elem: sourceId }] });
  await db.collection('richpresences').updateMany({ userId: sourceId }, { $set: { userId: targetId } });
  await db.collection('serverbans').updateMany({ userId: sourceId }, { $set: { userId: targetId } });
  await db.collection('invites').updateMany({ createdBy: sourceId }, { $set: { createdBy: targetId } });
  await db.collection('adminlogs').updateMany({ adminId: sourceId }, { $set: { adminId: targetId } });
  await db.collection('adminlogs').updateMany({ targetUserId: sourceId }, { $set: { targetUserId: targetId } });

  // 8. Merge relationship lists (friends, blocked, pending requests) on the target user.
  const mergedFriends = new Set<string>(target.friends?.map((id: any) => toObjectId(id).toString()) || []);
  const mergedBlocked = new Set<string>(target.blockedUsers?.map((id: any) => toObjectId(id).toString()) || []);
  const mergedIncoming = new Set<string>(target.pendingFriendRequests?.incoming?.map((id: any) => toObjectId(id).toString()) || []);
  const mergedOutgoing = new Set<string>(target.pendingFriendRequests?.outgoing?.map((id: any) => toObjectId(id).toString()) || []);

  for (const id of source.friends || []) mergedFriends.delete(toObjectId(id).toString());
  for (const id of source.blockedUsers || []) mergedBlocked.add(toObjectId(id).toString());
  for (const id of source.pendingFriendRequests?.incoming || []) mergedIncoming.add(toObjectId(id).toString());
  for (const id of source.pendingFriendRequests?.outgoing || []) mergedOutgoing.add(toObjectId(id).toString());

  // Remove source from other users' relationship lists.
  await db.collection('users').updateMany(
    { $or: [{ friends: sourceId }, { blockedUsers: sourceId }, { 'pendingFriendRequests.incoming': sourceId }, { 'pendingFriendRequests.outgoing': sourceId }] },
    {
      $pull: {
        friends: sourceId,
        blockedUsers: sourceId,
        'pendingFriendRequests.incoming': sourceId,
        'pendingFriendRequests.outgoing': sourceId,
      } as any,
    }
  );

  // 9. Update target's email to the source's email (so login works with saki@schoolsquid.xyz).
  await usersCollection.updateOne(
    { _id: targetId },
    {
      $set: {
        email: source.email || target.email,
        friends: Array.from(mergedFriends).map((id) => new mongoose.Types.ObjectId(id)),
        blockedUsers: Array.from(mergedBlocked).map((id) => new mongoose.Types.ObjectId(id)),
        'pendingFriendRequests.incoming': Array.from(mergedIncoming).map((id) => new mongoose.Types.ObjectId(id)),
        'pendingFriendRequests.outgoing': Array.from(mergedOutgoing).map((id) => new mongoose.Types.ObjectId(id)),
      },
    }
  );

  // 10. Delete the source user.
  await usersCollection.deleteOne({ _id: sourceId });

  console.log('\n✅ Merge complete.');
  console.log(`Target user ${target.username} now has email ${source.email || target.email}.`);
  console.log(`Source user ${source.username} has been deleted.`);
  console.log('\nYou may want to clear the saved_accounts cookie and re-add accounts.');

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
