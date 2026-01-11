import { Post } from '../models/post.js';
import { Op } from 'sequelize';

// function to create a new post - NEW POST
export const newPost = async (req, res) => {
   // destructure objects from req body
   const { title, author, body } = req.body

   try {
      // builds a new model post instance and calls save on it
      const post = await Post.create({
         title,
         author,
         body,
         category: Array.isArray(req.body.category) ? req.body.category : [req.body.category],
         favorite: req.body.favorite,
         date: new Date(req.body.date),
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

// function to fetch all posts from database - GET POSTS
export const getPosts = async (req, res) => {
   try {
      // retrieve all posts ordered by date (most recent first_
      const posts = await Post.findAll({
         order: [['date', 'DESC']], // order posts by date
      });

      // if no posts are found
      if (posts.length === 0) {
         return res.status(200).json({ success: false, message: 'No posts found.' });
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

// function to fetch individual post by ID - GET POST BY ID
export const getPostById = async (req, res) => {
   try {
      // find the post by primary key (assumes 'id' is the primary key in the post model)
      const post = await Post.findByPk(req.params.id);

      // if post is not found, handle the empty result
      if (!post) {
         return res
            .status(404)
            .json({ success: false, message: 'No post with that ID was found.' });
      }

      // send post data to client
      res.status(200).json({ success: true, message: 'Successfully fetched post.', data: post });
   } catch (error) {
      console.error('Error fetching post:', error);
      res.status(500).json({
         success: false,
         message: 'Error fetching post.',
         error: error.message,
      });
   }
};

// function to update a post by id - UPDATE POST BY ID
export const updatePostById = async (req, res) => {
   try {
      const post = await Post.findByPk(req.params.id);

      if (!post) {
         return res.status(404).json({ success: false, message: 'No post with that ID was found.' });
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
         data: updatedPost, // returns updated post
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

// function to delete a post by ID - DELETE POST BY ID
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
      res.status(200).json({ success: true, message: 'Post deleted successfully.' });
   } catch (error) {
      console.error('Error deleting post:', error);
      res.status(500).json({
         success: false,
         message: 'Error deleting post.',
         error: error.message,
      });
   }
};

// function to count all posts - GET POST COUNT
export const getPostCount = async (req, res) => {
   try {
      // count the number of records
      const postCount = await Post.count({});

      // send post count to client
      res.status(200).json({ success: true, message: 'Post count', data: postCount });
   } catch (error) {
      console.error('Error fetching post count:', error);
      res.status(500).json({
         success: false,
         message: 'Error fetching post count.',
         error: error.message,
      });
   }
};

// function to get the 5 most recently create posts - GET 5 RECENT POSTS
export const getRecentlyCreatedPosts = async (req, res) => {
   try {
      const mostRecentPosts = await Post.findAll({
         order: [['date', 'DESC']],
         limit: 5,
      });

      // if no recent posts are found
      if (mostRecentPosts.length === 0) {
         return res.status(404).json({ success: false, message: 'No recent posts found.' });
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

// function to search for post by title, date, or category - SEARCH POSTS
export const searchPosts = async (req, res) => {
   const { query } = req.query;

   // validate query parameters
   if (!query) {
      return res
         .status(400)
         .json({ success: false, message: 'Query parameter is required for searching posts.' });
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
         return res
            .status(404)
            .json({ success: false, message: 'No posts found matching your search query.' });
      }

      res.status(200).json({ success: true, message: 'search results', data: posts });
   } catch (error) {
      console.error('Error searching posts:', error);
      res.status(500).json({
         success: false,
         message: 'Error searching posts.',
         error: error.message,
      });
   }
};
