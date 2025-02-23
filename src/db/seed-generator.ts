import { drizzle } from 'drizzle-orm/d1';
import { users, posts, comments } from './schema';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Custom parameter replacer function
const replaceParams = (sql: string, params: any[]): string => {
  return sql.replace(/\?/g, (match) => {
    const value = params.shift();
    // Handle UUIDs, strings, and dates appropriately
    return typeof value === 'string' ? `'${value.replace(/'/g, "''")}'` : value;
  });
};

const db = drizzle({} as any);

// Generate fixed UUIDs for relationships
const aliceId = '11111111-1111-4111-8111-111111111111';
const bobId = '22222222-2222-4222-8222-222222222222';
const postIds = [
  '33333333-3333-4333-8333-333333333333',
  '44444444-4444-4444-8444-444444444444',
  '55555555-5555-4555-8555-555555555555',
];

const sampleUsers = [
  {
    id: aliceId,
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    createdAt: new Date().toISOString(),
  },
  {
    id: bobId,
    name: 'Bob Smith',
    email: 'bob.smith@example.com',
    createdAt: new Date().toISOString(),
  },
];

const samplePosts = [
  {
    id: postIds[0],
    userId: aliceId,
    title: 'Introduction',
    content: 'Hello, World! Excited to join this community.',
    createdAt: new Date().toISOString(),
  },
  {
    id: postIds[1],
    userId: bobId,
    title: 'Welcome',
    content: 'Hello, Alice! Welcome to the community!',
    createdAt: new Date().toISOString(),
  },
  {
    id: postIds[2],
    userId: aliceId,
    title: 'Thank You',
    content: 'Thanks, Bob! Glad to be here.',
    createdAt: new Date().toISOString(),
  },
];

const sampleComments = [
  {
    id: '66666666-6666-4666-8666-666666666666',
    userId: bobId,
    postId: postIds[0],
    content: 'Welcome, Alice! Looking forward to your posts.',
    createdAt: new Date().toISOString(),
  },
  {
    id: '77777777-7777-4777-8777-777777777777',
    userId: aliceId,
    postId: postIds[1],
    content: 'Thank you, Bob! Excited to be part of the conversation.',
    createdAt: new Date().toISOString(),
  },
];

const sqlStatements: string[] = [];

// Process deletes
[comments, posts, users].forEach((table) => {
  const { sql } = db.delete(table).toSQL();
  sqlStatements.push(sql);
});

// Process inserts with parameter substitution
const processInsert = (query: any) => {
  const { sql, params } = query.toSQL();
  return replaceParams(sql, params);
};

// Insert users
sqlStatements.push(processInsert(db.insert(users).values(sampleUsers)));

// Insert posts
sqlStatements.push(processInsert(db.insert(posts).values(samplePosts)));

// Insert comments
sqlStatements.push(processInsert(db.insert(comments).values(sampleComments)));

// Generate final SQL script
const seedSQL = sqlStatements.join(';\n') + ';\n';

// Write to seed.sql in migrations folder
const migrationDir = join(__dirname, 'migrations');
const seedFile = join(migrationDir, 'seed.sql');
writeFileSync(seedFile, seedSQL);
console.log('Seed SQL file generated at:', seedFile);
