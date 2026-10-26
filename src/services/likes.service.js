const prisma = require('../db');

async function createLike(postId, userId) {
  const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } });
  if (!post) {
    const error = new Error('Post not found');
    error.status = 404;
    throw error;
  }
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }
  return prisma.like.create({ data: { postId, userId } });
}

function deleteLike(postId, userId) {
  return prisma.like.delete({ where: { userId_postId: { userId, postId } } });
}

module.exports = { createLike, deleteLike };
