import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { users, posts, comments } from './db/schema';
import { eq } from 'drizzle-orm';

export type Env = {
  DB_PROD: D1Database;
};

const app = new Hono<{ Bindings: Env }>().basePath('/api/v1');

// Health check endpoint
app.get('/', (c) => {
  return c.text('Hello Hono!');
});

// User endpoints
app.get('/users', async (c) => {
  const db = drizzle(c.env.DB_PROD);
  const result = await db.select().from(users).all();
  return c.json(result);
});

app.get('/users/:id', async (c) => {
  const db = drizzle(c.env.DB_PROD);
  const id = c.req.param('id');
  const result = await db.select().from(users).where(eq(users.id, id)).get();
  if (!result) {
    return c.json({ error: 'User not found' }, 404);
  }
  return c.json(result);
});

app.post('/users', async (c) => {
  const db = drizzle(c.env.DB_PROD);
  const { email, name } = await c.req.json();

  try {
    const result = await db.insert(users).values({ email, name }).returning();
    return c.json(result);
  } catch (error: any) {
    // Check if error is due to unique constraint violation (duplicate email)
    if (error.message?.includes('UNIQUE constraint failed')) {
      return c.json({ error: 'A user with this email already exists' }, 409);
    }
    // Handle other unexpected errors
    return c.json({ error: 'An unexpected error occurred' }, 500);
  }
});

app.put('/users/:id', async (c) => {
  const db = drizzle(c.env.DB_PROD);
  const id = c.req.param('id');
  const { email, name } = await c.req.json();

  try {
    const result = await db
      .update(users)
      .set({ email, name })
      .where(eq(users.id, id))
      .returning();
    if (!result.length) {
      return c.json({ error: 'User not found' }, 404);
    }
    return c.json(result[0]);
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint failed')) {
      return c.json({ error: 'A user with this email already exists' }, 409);
    }
    return c.json({ error: 'An unexpected error occurred' }, 500);
  }
});

app.delete('/users/:id', async (c) => {
  const db = drizzle(c.env.DB_PROD);
  const id = c.req.param('id');
  const result = await db.delete(users).where(eq(users.id, id)).returning();
  if (!result.length) {
    return c.json({ error: 'User not found' }, 404);
  }
  return c.json({ message: 'User deleted successfully' });
});

// Post endpoints
app.get('/posts', async (c) => {
  const db = drizzle(c.env.DB_PROD);
  const result = await db.select().from(posts).all();
  return c.json(result);
});

app.get('/posts/:id', async (c) => {
  const db = drizzle(c.env.DB_PROD);
  const id = c.req.param('id');
  const result = await db.select().from(posts).where(eq(posts.id, id)).get();
  if (!result) {
    return c.json({ error: 'Post not found' }, 404);
  }
  return c.json(result);
});

app.get('/users/:userId/posts', async (c) => {
  const db = drizzle(c.env.DB_PROD);
  const userId = c.req.param('userId');
  const result = await db
    .select()
    .from(posts)
    .where(eq(posts.userId, userId))
    .all();
  return c.json(result);
});

app.post('/posts', async (c) => {
  const db = drizzle(c.env.DB_PROD);
  const { userId, title, content } = await c.req.json();
  const result = await db
    .insert(posts)
    .values({ userId, title, content })
    .returning();
  return c.json(result);
});

app.put('/posts/:id', async (c) => {
  const db = drizzle(c.env.DB_PROD);
  const id = c.req.param('id');
  const { title, content } = await c.req.json();
  const result = await db
    .update(posts)
    .set({ title, content })
    .where(eq(posts.id, id))
    .returning();
  if (!result.length) {
    return c.json({ error: 'Post not found' }, 404);
  }
  return c.json(result[0]);
});

app.delete('/posts/:id', async (c) => {
  const db = drizzle(c.env.DB_PROD);
  const id = c.req.param('id');
  const result = await db.delete(posts).where(eq(posts.id, id)).returning();
  if (!result.length) {
    return c.json({ error: 'Post not found' }, 404);
  }
  return c.json({ message: 'Post deleted successfully' });
});

// Comment endpoints
app.get('/posts/:postId/comments', async (c) => {
  const db = drizzle(c.env.DB_PROD);
  const postId = c.req.param('postId');
  const result = await db
    .select()
    .from(comments)
    .where(eq(comments.postId, postId))
    .all();
  return c.json(result);
});

app.get('/comments/:id', async (c) => {
  const db = drizzle(c.env.DB_PROD);
  const id = c.req.param('id');
  const result = await db
    .select()
    .from(comments)
    .where(eq(comments.id, id))
    .get();
  if (!result) {
    return c.json({ error: 'Comment not found' }, 404);
  }
  return c.json(result);
});

app.post('/comments', async (c) => {
  const db = drizzle(c.env.DB_PROD);
  const { userId, postId, content } = await c.req.json();
  const result = await db
    .insert(comments)
    .values({ userId, postId, content })
    .returning();
  return c.json(result);
});

app.put('/comments/:id', async (c) => {
  const db = drizzle(c.env.DB_PROD);
  const id = c.req.param('id');
  const { content } = await c.req.json();
  const result = await db
    .update(comments)
    .set({ content })
    .where(eq(comments.id, id))
    .returning();
  if (!result.length) {
    return c.json({ error: 'Comment not found' }, 404);
  }
  return c.json(result[0]);
});

app.delete('/comments/:id', async (c) => {
  const db = drizzle(c.env.DB_PROD);
  const id = c.req.param('id');
  const result = await db
    .delete(comments)
    .where(eq(comments.id, id))
    .returning();
  if (!result.length) {
    return c.json({ error: 'Comment not found' }, 404);
  }
  return c.json({ message: 'Comment deleted successfully' });
});

export default app;
