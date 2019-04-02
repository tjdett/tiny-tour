import * as tinyoverlay from "./tour/overlay.js";
import * as blogs from "./blogs/blogs.js";

const init = (tourConfig, mode, skin) => {
  // If no mode/skin was passed, then attempt to load from local storage.
  // However if local storage doesn't have any data either, then fallback to some defaults.
  mode = mode || window.localStorage.getItem('tiny-blog.mode') || 'basic';
  skin = skin || window.localStorage.getItem('tiny-blog.skin') || 'oxide';

  // Initialize the blog app
  const blogApp = blogs.initApp(mode, skin);

  // Add a dummy blog
  blogApp.addBlog('Test', 'Some content');

  const overlay = tinyoverlay.init(tourConfig);
  overlay.bindActionOverlays();
  const help = document.getElementById('help');
  help.addEventListener('click', overlay.showHelpOverlays);
};

export {
  init
}