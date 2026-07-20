/**
 * One-shot migration: drop legacy indexes that no longer match the schema.
 *
 * The richpresences collection historically had a UNIQUE index on `userId`
 * alone (one presence per user). Multiple activities per user are now allowed,
 * so that index causes E11000 duplicate-key errors on the 2nd+ activity. The
 * current schema instead uses a compound unique index { userId, type, name }.
 *
 * Run with:  bun run scripts/drop-stale-indexes.ts
 */
import { connectDB, disconnectDB } from '../src/lib/db/mongodb';
import { RichPresence } from '../src/lib/models/RichPresence';

async function main() {
  await connectDB();

  const indexes = await RichPresence.collection.indexes();
  const stale = indexes.find(
    (i) => i.name === 'userId_1' && i.unique === true
  );

  if (stale) {
    await RichPresence.collection.dropIndex('userId_1');
    console.log('✅ Dropped stale unique index richpresences.userId_1');
  } else {
    console.log('ℹ️  No stale userId_1 unique index found — nothing to do.');
  }

  // Ensure the current schema indexes exist.
  await RichPresence.syncIndexes();
  console.log('✅ RichPresence indexes synced.');

  await disconnectDB();
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
