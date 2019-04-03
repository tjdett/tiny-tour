import { Tour } from "./tour/tour.js";
import { BlogsApp } from "./blogs/blogs.js";

const init = async (tourConfig, mode, skin) => {
  // Initialize the blog app
  const blogApp = await BlogsApp(mode, skin);

  // Initialize the tour
  const tour = Tour(tourConfig);
  tour.start();

  // Notify the tour of events that occur in the blog app
  blogApp.on('save edit', (e) => {
    tour.notify(e.type);
  });
};

export {
  init
}