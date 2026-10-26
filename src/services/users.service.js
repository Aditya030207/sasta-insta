const prisma = require('../db');
const { listPosts } = require('./posts.service');

function createUser(data) {
  return prisma.user.create({ data });
}

async function listUsers({ page, limit, skip, sortBy = 'createdAt', order = 'desc', where = {} }) {
  const [data, total] = await prisma.$transaction([
    prisma.user.findMany({ where, orderBy: { [sortBy]: order }, skip, take: limit }),
    prisma.user.count({ where }),
  ]);
  return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

function getUserById(id) {
  return prisma.user.findUnique({ where: { id }, include: { _count: { select: { posts: true, likes: true } } } });
}

function updateUser(id, data) {
  return prisma.user.update({ where: { id }, data });
}

function deleteUser(id) {
  return prisma.user.delete({ where: { id } });
}

async function getUserPosts(id, pagination) {
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!user) {
    return null;
  }
  return listPosts({ ...pagination, where: { authorId: id }, include: { _count: { select: { likes: true } } } });
}

async function getLikedPosts(id, pagination) {
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!user) {
    return null;
  }
  return listPosts({ ...pagination, where: { likes: { some: { userId: id } } } });
}

module.exports = { createUser, listUsers, getUserById, updateUser, deleteUser, getUserPosts, getLikedPosts };
