import * as tinyoverlay from "./tour/overlay.js";
import * as editor from "./blogs/editor.js";
import * as blogs from "./blogs/blogs.js";

const init = (mode, tourConfig) => {
  blogs.initApp();

  editor.load(mode).then((ed) => {
    const save = document.getElementById('save');
    save.addEventListener('click', () => {
      // Get the blog title element
      const titleEle = document.getElementById('blog-title');

      // Create the blog and add it to the blogs list
      const newBlog = blogs.createBlog(titleEle.value, ed.getContent());
      document.getElementById('blogs').appendChild(newBlog);

      // Reset the blog input/editor
      titleEle.value = null;
      editor.reset(ed);
    });
  });


  const overlay = tinyoverlay.init(tourConfig);
  overlay.bindActionOverlays();
  const help = document.getElementById('help');
  help.addEventListener('click', overlay.showHelpOverlays);
};

export {
  init
}