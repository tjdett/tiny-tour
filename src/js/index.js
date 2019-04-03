import { Tour } from "./tour/tour.js";
import { BlogsApp } from "./blogs/blogs.js";

const init = async (tourConfig, mode, skin) => {
  // Initialize the blog app
  const blogApp = await BlogsApp(mode, skin);

  // // Add a dummy blog
  // if (blogApp.getBlogs().length === 0) {
  //   blogApp.addBlog('Test', 'Some content');
  // }

  // Initialize the tour
  const tour = Tour(tourConfig);
  tour.start();

  blogApp.on('save edit', (e) => {
    tour.notify(e.type);
  });

  const help = document.getElementById('help');
  help.addEventListener('click', () => {
    tour.resume();
  });
};

export {
  init
}