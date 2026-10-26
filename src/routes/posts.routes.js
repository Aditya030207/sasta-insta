const router = require('express').Router();
const posts = require('../controllers/posts.controller');
const likes = require('../controllers/likes.controller');

router.post('/', posts.create);
router.get('/', posts.list);
router.get('/:id', posts.getOne);
router.patch('/:id', posts.update);
router.delete('/:id', posts.remove);
router.get('/:id/likes', posts.likes);
router.post('/:id/likes', likes.create);
router.delete('/:id/likes/:userId', likes.remove);

module.exports = router;
