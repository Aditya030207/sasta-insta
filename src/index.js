const express = require('express');
const usersRouter = require('./routes/users.routes');
const postsRouter = require('./routes/posts.routes');

const app = express();
app.use(express.json());
app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));
app.use('/users', usersRouter);
app.use('/posts', postsRouter);

app.use((error, req, res, next) => {
  if (error.code === 'P2002') {
    let message = 'username or email already taken';
    if (req.path.includes('/likes')) {
      message = 'Already liked';
    }
    return res.status(409).json({ error: message });
  }
  if (error.code === 'P2025') {
    let entity = 'Post';
    if (req.path.includes('/likes/')) {
      entity = 'Like';
    } else if (req.path.startsWith('/users')) {
      entity = 'User';
    }
    return res.status(404).json({ error: `${entity} not found` });
  }
  if (error.code === 'P2003') {
    return res.status(404).json({ error: 'User not found' });
  }
  if (error.status) {
    return res.status(error.status).json({ error: error.message });
  }
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

if (require.main === module) {
  app.listen(3000, () => console.log('Server started on port 3000'));
}

module.exports = app;
