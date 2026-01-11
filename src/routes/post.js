import { Router } from 'express';
const router = Router();

// post controller functions
import {
   newPost,
   getPosts,
   getPostById,
   updatePostById,
   deletePostById,
   getRecentlyCreatedPosts,
   getPostCount,
   searchPosts,
} from '../controllers/post.js';

// GET /api/posts/count - count all posts
router.get('/count', getPostCount);

// GET /api/posts/recent - get recent posts
router.get('/recent', getRecentlyCreatedPosts);

// GET /api/posts/search - search posts
router.get('/search', searchPosts);

// GET /api/posts/:id - get post by ID
// (must come after specific routes like 'count' or 'recent')
router.get('/:id', getPostById);

// POST /api/posts - create new post
router.post('/', newPost);

// GET /api/posts - get all posts
router.get('/', getPosts);

// PATCH /api/posts/:id - update post by ID
router.patch('/:id', updatePostById);

// DELETE /api/posts/:id - delete post by ID
router.delete('/:id', deletePostById);

export { router as postRouter };
