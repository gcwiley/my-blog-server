import { Post } from './post.model.js';
import { User } from './user.model.js';

// --- ASSOCIATIONS ---
// ready to define when needed e.g.:
// User.hasMany(Post, { foreignKey: 'authorId' });
// Post.belongsTo(User, { foreignKey: 'authorId' });

export { Post, User };