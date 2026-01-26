import { Post } from '../models/post.js';
import { Op } from 'sequelize';

// validate ID function
import { isValidUUID } from '../helpers/validate.js';

// CREATE NEW POST
export const newPost = async (req, res) => {
  try {
    const { title, author, body, category, favorite, date } = req.body;
    const post = await Post.create({
      title,
      author,
      body,
      category,
      favorite,
      date: new Date(date),
    });
    res.status(201).json({
      success: true,
      message: 'Successfully created a new post.',
      data: post,
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating post.',
      error: error.message,
    });
  }
};

// GET POSTS
export const getPosts = async (req, res) => {
  try {
    // retrieve all posts ordered by date (most recent first_
    const posts = await Post.findAll({
      order: [['date', 'DESC']], // order posts by date
    });

    // if no posts are found
    if (posts.length === 0) {
      return res
        .status(200)
        .json({ success: false, message: 'No posts found.' });
    }

    // send the list of posts to the client
    res.status(200).json({
      success: true,
      message: 'Successfully fetched all posts.',
      data: posts,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching posts.',
      error: error.message,
    });
  }
};

// GET POSTS WITH PAGINATION
export const getPostsWithPagination = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: posts } = await Post.findAndCountAll({
      order: [['date', 'DESC']],
      limit,
      offset,
    });

    res.status(200).json({
      success: true,
      message: posts.length ? 'Successfully fetched posts.' : 'No posts found.',
      data: posts,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching posts.',
      error: error.message,
    });
  }
};

// GET POST BY ID
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid post ID format.' });
    }

    const post = await Post.findByPk(id);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: 'No post with that ID was found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Successfully fetched post.',
      data: post,
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching post.',
      error: error.message,
    });
  }
};

// UPDATE POST BY ID - fix this!
export const updatePostById = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: 'No post with that ID was found.' });
    }
    const updatedPost = await post.update({
      title: req.body.title,
      author: req.body.author,
      body: req.body.body,
      category: req.body.category,
      favorite: req.body.favorite,
      date: new Date(req.body.date),
    });

    res.status(200).json({
      success: true,
      message: 'Successfully updated post.',
      data: updatedPost,
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating post.',
      error: error.message,
    });
  }
};

// DELETE POST BY ID
export const deletePostById = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);

    // if no post is found
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: 'No post with that ID was found.' });
    }

    await post.destroy({
      logging: true,
    });
    res
      .status(200)
      .json({ success: true, message: 'Post deleted successfully.' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting post.',
      error: error.message,
    });
  }
};

// GET POST COUNT
export const getPostCount = async (req, res) => {
  try {
    // count the number of records
    const postCount = await Post.count({});

    // send post count to client
    res
      .status(200)
      .json({ success: true, message: 'Post count', data: postCount });
  } catch (error) {
    console.error('Error fetching post count:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching post count.',
      error: error.message,
    });
  }
};

// GET 5 RECENT POSTS
export const getRecentlyCreatedPosts = async (req, res) => {
  try {
    const mostRecentPosts = await Post.findAll({
      order: [['date', 'DESC']],
      limit: 5,
    });

    // if no recent posts are found
    if (mostRecentPosts.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'No recent posts found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Successfully fetched recent posts.',
      data: mostRecentPosts,
    });
  } catch (error) {
    console.error('Error fetching recent posts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent posts.',
      error: error.message,
    });
  }
};

// SEARCH POSTS
export const searchPosts = async (req, res) => {
  const { query } = req.query;

  // validate query parameters
  if (!query) {
    return res.status(400).json({
      success: false,
      message: 'Query parameter is required for searching posts.',
    });
  }

  try {
    const posts = await Post.findAll({
      where: {
        // uses the Op.or operator to search for albums that match any of the search criteria.
        [Op.or]: [
          // uses the 'Op.iLike' operator for case-insensitive search
          { title: { [Op.iLike]: `%${query}%` } },
          { date: { [Op.iLike]: `%${query}%` } },
          { category: { [Op.iLike]: `%${query}%` } },
        ],
      },
    });

    if (posts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No posts found matching your search query.',
      });
    }

    res
      .status(200)
      .json({ success: true, message: 'search results', data: posts });
  } catch (error) {
    console.error('Error searching posts:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching posts.',
      error: error.message,
    });
  }
};
