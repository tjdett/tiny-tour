import { Tour } from "./tour/tour.js";
import { BlogsApp } from "./blogs/blogs.js";

const init = (tourConfig, mode, skin) => {
  // Initialize the blog app
  const blogApp = BlogsApp(mode, skin);

  // Add a dummy blog
  if (blogApp.getBlogs().length === 0) {
    blogApp.addBlog('Test', 'Some content');
  }

  // Initialize the tour
  const tour = Tour(tourConfig);

  blogApp.on('init', () => {
    tour.start();
  });

  blogApp.on('save edit', (e) => {
    tour.notify(e.type);
  });
};

export {
  init
}