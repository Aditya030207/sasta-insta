const prisma = require('../db');

const userSummary = { id: true, username: true, fullname: true };
const postInclude = { author: { select: userSummary }, _count: { select: { likes: true } } };

function createPost(data) {
  return prisma.post.create({ data });
}

async function listPosts({ page, limit, skip, sortBy = 'createdAt', order = 'desc', where = {}, include = postInclude }) {
  let orderBy;
  if (sortBy === 'likes') {
    orderBy = [{ likes: { _count: order } }, { createdAt: 'desc' }];
  } else {
    orderBy = { [sortBy]: order };
  }
  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({ where, orderBy, skip, take: limit, include }),
    prisma.post.count({ where }),
  ]);
  return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

function getPostById(id) {
  return prisma.post.findUnique({ where: { id }, include: postInclude });
}

function updatePost(id, data) {
  return prisma.post.update({ where: { id }, data });
}

function deletePost(id) {
  return prisma.post.delete({ where: { id } });
}

async function getPostLikes(id) {
  const post = await prisma.post.findUnique({
    where: { id },
    select: { likes: { orderBy: { user: { username: 'asc' } }, select: { user: { select: userSummary } } } },
  });
  if (!post) {
    return null;
  }
  return post.likes.map(like => like.user);
}

module.exports = { createPost, listPosts, getPostById, updatePost, deletePost, getPostLikes };
