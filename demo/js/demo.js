import "../../dist/bundle.js";

const tourConfig = {
  steps: [
    {
      title: 'Create Content',
      url: './tour/create.html',
      details: 'Enter a title and some content to create a new blog post, then click the save button.',
      proceedOnEvent: 'save'
    },
    {
      title: 'Save',
      helpUrl: './tour/save.html'
    },
    {
      title: 'Edit Content',
      url: './tour/edit.html',
      details: 'Click the edit button, make some changes and then click the save button.',
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
const tour = tinyTour.Tour(tourConfig);

// Initialize the blog app
tinyTour.BlogsApp().then((blogApp) => {
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