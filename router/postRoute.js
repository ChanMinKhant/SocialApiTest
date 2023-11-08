const router = require('express').Router();
const { verifyJWT } = require('../middleware/verifyJWT');
const {
  createPost,
  getPost,
  updatePost,
  deletePost,
} = require('../controllers/postController');

router.route('/').post(verifyJWT, createPost);
router.route('/:id').get(verifyJWT, getPost);
router.route('/:id').put(verifyJWT, updatePost);
router.route('/:id').delete(verifyJWT, deletePost);

module.exports = router;
