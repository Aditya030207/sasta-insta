const users = require('../services/users.service');
const pagination = require('../utils/pagination');

async function create(req, res) {
  const { username, email, fullname, bio } = req.body ?? {};
  if (!username || !email || !fullname) {
    return res.status(400).json({ error: 'username, email and fullname are required' });
  }
  const user = await users.createUser({ username, email, fullname, bio });
  res.status(201).json(user);
}

async function list(req, res) {
  const paging = pagination(req.query);
  const { sortBy = 'createdAt', order = 'desc', isPrivate, search, hasPosts } = req.query;
  if (!['createdAt', 'username', 'fullname'].includes(sortBy)) {
    return res.status(400).json({ error: 'sortBy must be one of: createdAt, username, fullname' });
  }
  if (!['asc', 'desc'].includes(order)) {
    return res.status(400).json({ error: 'order must be asc or desc' });
  }
  const where = {};
  if (isPrivate !== undefined && isPrivate !== 'true' && isPrivate !== 'false') {
    return res.status(400).json({ error: 'isPrivate must be true or false' });
  }
  if (hasPosts !== undefined && hasPosts !== 'true' && hasPosts !== 'false') {
    return res.status(400).json({ error: 'hasPosts must be true or false' });
  }

  if (isPrivate !== undefined) {
    where.isPrivate = isPrivate === 'true';
  }
  if (hasPosts === 'true') {
    where.posts = { some: {} };
  } else if (hasPosts === 'false') {
    where.posts = { none: {} };
  }
  if (search !== undefined) {
    where.OR = [
      { username: { contains: String(search), mode: 'insensitive' } },
      { fullname: { contains: String(search), mode: 'insensitive' } }
    ];
  }
  const result = await users.listUsers({ ...paging, sortBy, order, where });
  res.json(result);
}

async function getOne(req, res) {
  const user = await users.getUserById(Number(req.params.id));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
}

async function update(req, res) {
  const { fullname, bio, isPrivate } = req.body ?? {};
  const id = Number(req.params.id);
  const user = await users.updateUser(id, { fullname, bio, isPrivate });
  res.json(user);
}

async function remove(req, res) {
  await users.deleteUser(Number(req.params.id));
  res.status(204).end();
}

async function posts(req, res) {
  const result = await users.getUserPosts(Number(req.params.id), pagination(req.query));
  if (!result) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(result);
}

async function likedPosts(req, res) {
  const result = await users.getLikedPosts(Number(req.params.id), pagination(req.query));
  if (!result) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(result);
}

module.exports = { create, list, getOne, update, remove, posts, likedPosts };
