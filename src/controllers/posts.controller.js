const posts = require('../services/posts.service');
const pagination = require('../utils/pagination');

async function create(req, res) {
  const { imageUrl, authorId, caption, location } = req.body ?? {};
  if (!imageUrl || !authorId) {
    return res.status(400).json({ error: 'imageUrl and authorId are required' });
  }
  const post = await posts.createPost({ imageUrl, authorId, caption, location });
  res.status(201).json(post);
}

async function list(req, res) {
  const paging = pagination(req.query);
  const { sortBy = 'createdAt', order = 'desc', location, search, from, to } = req.query;
  if (!['createdAt', 'updatedAt', 'likes'].includes(sortBy)) {
    return res.status(400).json({ error: 'sortBy must be one of: createdAt, updatedAt, likes' });
  }
  if (!['asc', 'desc'].includes(order)) {
    return res.status(400).json({ error: 'order must be asc or desc' });
  }
  const where = {};
  if (location !== undefined) where.location = { equals: String(location), mode: 'insensitive' };
  if (search !== undefined) where.caption = { contains: String(search), mode: 'insensitive' };
  if (from !== undefined) {
    const fromDate = new Date(from);
    if (typeof from !== 'string' || Number.isNaN(fromDate.getTime())) {
      return res.status(400).json({ error: 'from and to must be valid dates' });
    }
    where.createdAt = { gte: fromDate };
  }
  if (to !== undefined) {
    const toDate = new Date(to);
    if (typeof to !== 'string' || Number.isNaN(toDate.getTime())) {
      return res.status(400).json({ error: 'from and to must be valid dates' });
    }
    if (!where.createdAt) {
      where.createdAt = {};
    }
    where.createdAt.lt = toDate;
  }
  const result = await posts.listPosts({ ...paging, sortBy, order, where });
  res.json(result);
}

async function getOne(req, res) {
  const post = await posts.getPostById(Number(req.params.id));
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  res.json(post);
}

async function update(req, res) {
  const { caption, location } = req.body ?? {};
  const id = Number(req.params.id);
  const post = await posts.updatePost(id, { caption, location });
  res.json(post);
}

async function remove(req, res) {
  await posts.deletePost(Number(req.params.id));
  res.status(204).end();
}

async function likes(req, res) {
  const result = await posts.getPostLikes(Number(req.params.id));
  if (!result) {
    return res.status(404).json({ error: 'Post not found' });
  }
  res.json(result);
}

module.exports = { create, list, getOne, update, remove, likes };
