import express from 'express';
import {
  getAllPosts,
  getSinglePost,
  createPost,
  updatePost,
  deletePost,
  getMyPosts,
} from '../controllers/postController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/* IMPORTANT: specific routes first */
router.get('/user/myposts', protect, getMyPosts);

router.get('/', getAllPosts);
router.get('/:id', getSinglePost);

router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

export default router;