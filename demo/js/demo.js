import "../../dist/bundle.js";

const tourConfig = {
  steps: [
    {
      title: 'Create Content',
      url: './tour/create.html',
      details: 'Enter a title and some content to create a new blog post, then click the save button.',
      proceedOnEvent: 'save',
      tooltips: [
        {
          target: '.blog-title',
          content: 'Please enter a title'
        },
        {
          target: '.blog-content',
          content: 'Please enter some content'
        },
      ]
    },
    {
      title: 'Save',
      url: './tour/save.html'
    },
    {
      title: 'Edit Content',
      url: './tour/edit.html',
      details: 'Click the edit button, make some changes and then click the save button.',
      proceedOnEvent: 'save',
      tooltips: [
        {
          target: '.blog-button__edit:first-of-type',
          content: 'Please click the edit button'
        }
      ]
    },
    {
      title: 'Exposing More Features in TinyMCE?',
      url: './tour/more-features.html'
    },
    {
      title: 'Changing How TinyMCE Looks via a Custom Skin',
      url: './tour/skinning.html',
      proceedOnEvent: 'skinChanged',
      tooltips: [
        {
          target: '.blog-skin',
          content: 'Please select a different skin'
        }
      ]
    },
    {
      title: 'Developer/Power User Spotlight: Modifying the HTML code',
      url: './tour/modifying-the-html-code.html'
    },
    {
      title: 'Business User Spotlight: Pasting Microsoft Word Content into TinyMCE',
      url: './tour/pasting-word-content-into-tinymce.html'
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
  blogApp.on('skinChanged', (e) => {
    tour.changeSkin(e.skin);
    tour.notify('skinChanged');
  });
});