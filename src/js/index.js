import { BlogsApp } from "./blogs/blogs.js";

const init = (tourConfig, mode, skin) => {
  // Initialize the blog app
  const blogApp = BlogsApp(mode, skin);

  // Add a dummy blog
  if (blogApp.getBlogs().length === 0) {
    blogApp.addBlog('Test', 'Some content');
  }
};

export {
  init
}