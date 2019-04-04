import { Tour } from "../../src/js/tour/tour.js";
import { BlogsApp } from "../../src/js/blogs/blogs.js";

const tourConfig = {
  steps: [
    {
      title: 'Create Content',
      url: './tour/create.html',
      details: 'Add a title and content, then click save',
      proceedOnEvent: 'save'
    },
    {
      title: 'Save',
      helpUrl: './tour/save.html'
    },
    {
      title: 'Edit Content',
      url: './tour/edit.html',
      details: 'Click the edit button, make some changes and then click save',
      proceedOnEvent: 'save'
    },
    {
      title: 'More features...',
      url: './tour/more-features.html'
    },
    {
      title: 'Skinning',
      url: './tour/skinning.html'
    }
  ]
};

// Initialize the tour
const tour = Tour(tourConfig);

// Initialize the blog app
BlogsApp().then((blogApp) => {
  tour.changeSkin(blogApp.getSkin());
  tour.start();

  // Notify the tour of events that occur in the blog app
  blogApp.on('save edit', (e) => {
    tour.notify(e.type);
  });

  // Notify the tour that the app skin changed
  blogApp.on('skinChange', (e) => {
    tour.changeSkin(e.skin);
  });
});