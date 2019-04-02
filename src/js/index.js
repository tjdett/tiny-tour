import * as tinyoverlay from "./tour/overlay.js";
import * as blogs from "./blogs/blogs.js";

const init = (tourConfig, mode, skin) => {
  // Initialize the blog app
  const blogApp = blogs.initApp(mode, skin);

  // Add a dummy blog
  if (blogApp.getBlogs().length === 0) {
    blogApp.addBlog('Test', 'Some content');
  }

  const overlay = tinyoverlay.init(tourConfig);
  overlay.bindActionOverlays();
  const help = document.getElementById('help');
  help.addEventListener('click', overlay.showHelpOverlays);
};

export {
  init
}