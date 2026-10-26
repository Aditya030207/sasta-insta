const likes = require('../services/likes.service');

async function create(req, res) {
  const { userId } = req.body ?? {};
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  const postId = Number(req.params.id);
  const like = await likes.createLike(postId, userId);
  res.status(201).json(like);
}

async function remove(req, res) {
  await likes.deleteLike(Number(req.params.id), Number(req.params.userId));
  res.status(204).end();
}

module.exports = { create, remove };
