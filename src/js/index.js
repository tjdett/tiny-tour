import * as tinyoverlay from "./tour/overlay.js";
import * as blogs from "./blogs/blogs.js";

const init = (mode, tourConfig) => {
  blogs.initApp(mode);

  const overlay = tinyoverlay.init(tourConfig);
  overlay.bindActionOverlays();
  const help = document.getElementById('help');
  help.addEventListener('click', overlay.showHelpOverlays);
};

export {
  init
}