import EventDispatcher from '../../../node_modules/EventDispatcher/src/EventDispatcher.js';
import * as editorUtils from './editor.js';
import { sendServerRequest } from './utils.js';

/**
 * Creates a Edit, Delete, etc... action button for a single blog post.
 */
const renderButton = (name, btnClasses, iconClasses) => {
  const editButton = document.createElement('button');
  editButton.className = 'blog-button ' + btnClasses;
  editButton.title = name;
  editButton.innerHTML = `<i class="${iconClasses}"></i>`;
  return editButton;
};

/**
 * Creates the wrapper and all buttons for a single blog post.
 */
const renderBlogButtons = (state, blogId) => {
  // Create a wrapper to hold the buttons
  const buttonsEle = document.createElement('div');
  buttonsEle.className = 'blog-buttons';

  // Create the edit/delete button elements
  const editButton = renderButton('Edit', 'blog-button__primary', 'far fa-edit');
  const deleteButton = renderButton('Delete', 'blog-button__error', 'far fa-trash-alt');

  // Wire up the button actions
  editButton.addEventListener('click', () => editBlog(state, blogId));
  deleteButton.addEventListener('click', () => deleteBlog(state, blogId));

  // Add the buttons to the wrapper
  buttonsEle.appendChild(editButton);
  buttonsEle.appendChild(deleteButton);

  return  buttonsEle;
};

/**
 * Renders a blog post and returns the built HTML for the title, content and action buttons.
 *
 * @param state The state of the various data in the application.
 * @param blog The blog post to render.
 */
const renderBlog = (state, blog) => {
  // Create the wrapper element to hold all the blog details
  const blogEle = document.createElement('div');
  blogEle.classList.add('blog');

  // Create the blog header element
  const innerEle = document.createElement('div');
  innerEle.className = 'inner';

  // Create the blog header element
  const header = document.createElement('h2');
  header.innerText = blog.title;

  // Create the blog content element
  const contentEle = document.createElement('div');
  contentEle.innerHTML = blog.content;

  // Create the blog buttons
  const buttonsEle = renderBlogButtons(state, blog.id);

  // Add all the newly created elements to dom
  innerEle.appendChild(header);
  innerEle.appendChild(contentEle);
  blogEle.appendChild(innerEle);
  blogEle.appendChild(buttonsEle);

  return blogEle;
};

/**
 * Saves any user settings to local storage, such as which skin or editor mode to use.
 *
 * @param settings The settings to save.
 */
const saveSettings = (settings) => {
  window.localStorage.setItem('tiny-blog.settings', JSON.stringify(settings));
};

/**
 * Loads any saved user settings from local storage.
 */
const loadSettings = () => {
  try {
    return JSON.parse(window.localStorage.getItem('tiny-blog.settings') || '{}');
  } catch (e) {
    console.error(e);
    return {};
  }
};

/**
 * Load all blog posts from the backend server.
 *
 * @returns {Promise} The loaded blogs
 */
const loadBlogs = async () => {
  return await fetch('/articles/')
    .then((response) => {
      if (response.status !== 200) {
        throw new Error("Failed to load blogs from storage");
      }
      return response.json();
    }).then((blogs) => {
      // Convert array of blogs to object mapped by id
      return blogs.articles.reduce((acc, blog) => {
        acc[blog.id] = blog;
        return acc;
      }, {});
    });
};

/**
 * Loads a blog entry content/title back into the editable area so that it can
 * be updated.
 *
 * @param state The state of the various data in the application.
 * @param blogId The id of the blog to edit from the stores blog list.
 */
const editBlog = (state, blogId) => {
  if (state.editor) {
    const blog = state.data.blogs[blogId];

    // Update the application state so we know we're now editing a post
    state.editing = true;
    state.editId = blog.id;

    // Update the TinyMCE editor content and add the blog-edit class
    editorUtils.reset(state.editor, blog.content);
    const editorEle = document.querySelector('.blogApp .blog-content');
    editorEle.classList.add('blog-edit');

    // Update the blog title
    const titleEle = document.querySelector('.blogApp .blog-title');
    titleEle.classList.add('blog-edit');
    titleEle.value = blog.title;

    // Register listeners to remove the blog-edit class once data has changed
    const changeHandler = () => {
      titleEle.classList.remove('blog-edit');
      titleEle.removeEventListener('change', changeHandler);
    };
    titleEle.addEventListener('change', changeHandler);
    state.editor.once('change', () => {
      editorEle.classList.remove('blog-edit');
    });

    // Dispatch an event to notify that we're editing a blog
    state.eventDispatcher.trigger('edit', [{ blogId: blog.id }]);
  }
};

/**
 * Creates a new blog by sending the title and content to the backend server via a POST request.
 *
 * @param state The state of the various data in the application.
 * @param title The title of the blog entry.
 * @param content The HTML content of the blog entry.
 */
const createBlog = async (state, title, content) => {
  await sendServerRequest(`/articles/`, { title: title, content: content });
  processDataUpdate(state);
};

/**
 * Updates an existing blog by sending the title and content to the backend server via a POST request.
 *
 * @param state The state of the various data in the application.
 * @param title The updated title of the blog post.
 * @param content The updated content of the blog post.
 * @param index The index of the blog to update from the stores blog list.
 */
const updateBlog = async (state, title, content, index) => {
  state.data.blogs[index] = {title: title, content: content};
  await sendServerRequest(`/articles/` + state.editId, { title: title, content: content }, "PUT");
  processDataUpdate(state);
};

/**
 * Deletes a blog at the specified index.
 *
 * @param state The state of the various data in the application.
 * @param blogId The id of the blog to delete from the stores blog list.
 */
const deleteBlog = async (state, blogId) => {
  const blog = state.data.blogs[blogId];
  if (blog) {
    sendServerRequest(`/articles/` + blogId, {title: "", content: ""}, "DELETE");
    processDataUpdate(state);
  }
};

/**
 * Processes the data after an update and updates the application state.
 *
 * @param state The state of the various data in the application.
 */
const processDataUpdate = async (state) => {
  state.editing = false;
  state.editId = null;
  state.data.blogs = await loadBlogs();
  renderBlogs(state);
};

/**
 * Re-populates the blogs list following add/edit/remove operations
 *
 * @param state The state of the various data in the application.
 */
const renderBlogs = (state) => {
  const blogsEle = document.querySelector('.blogApp .blogs');
  removeBlogsFromDOM(blogsEle);
  addBlogsToDOM(state, blogsEle);
};

/**
 * Builds up the DOM representation for all blogs in the datastore and adds them
 * to the blogs DOM list.
 *
 * @param state The state of the various data in the application.
 * @param dom The DOM element to add all the created blogs to.
 */
const addBlogsToDOM = (state, dom) => {
  const blogIds = Object.keys(state.data.blogs);
  if (blogIds.length > 0) {
    dom.innerHTML = '';
    blogIds.forEach((blogId) => {
      const blog = state.data.blogs[blogId];
      const blogEle = renderBlog(state, blog);
      dom.appendChild(blogEle);
    });
  }
};

/**
 * Remove all blogs from the blogs DOM element/list.
 *
 * @param dom The DOM element to remove all the blogs from.
 */
const removeBlogsFromDOM = (dom) => {
  while (dom.hasChildNodes()) {
    dom.removeChild(dom.lastChild);
  }
  dom.innerHTML = '<div class="no-blogs">No posts</div>';
};

/**
 * Saves or updates a new blog entry.
 *
 * @param state The state of the various data in the application.
 */
const save = (state) => {
  // Get the blog title/editor element
  const titleEle = document.querySelector('.blogApp .blog-title');
  const editorEle = document.querySelector('.blogApp .blog-content');

  // Get the data
  const title = titleEle.value;
  const content = state.editor.getContent();

  // Create the blog and add it to the blogs list
  if (title.length > 0 && content.length > 0) {
    if (state.editing) {
      updateBlog(state, title, content, state.editId);
    } else {
      createBlog(state, title, content);
    }
    state.editing = false;
    state.editId = null;
    // Reset the blog input/editor
    titleEle.value = null;
    editorUtils.reset(state.editor);

    state.eventDispatcher.trigger('save');
  } else {
    if (title.length === 0) {
      titleEle.classList.add('blog-error');
      const changeHandler = () => {
        titleEle.classList.remove('blog-error');
        titleEle.removeEventListener('change', changeHandler);
      };
      titleEle.addEventListener('change', changeHandler);
    }
    if (content.length === 0) {
      editorEle.classList.add('blog-error');
      state.editor.once('change', () => {
        editorEle.classList.remove('blog-error');
      });
    }
  }
};

const bindToggleChange = (name, changeHandler) => {
  const skinEles = document.querySelectorAll(`.blogApp input[name="${name}"]`);
  skinEles.forEach((ele) => {
    ele.addEventListener('change', (e) => changeHandler(name, e));
  })
};

/**
 * Build up the initial HTML for the application.
 *
 * @param state The state of the various data in the application.
 * @returns {string} The core application HTML.
 */
const buildInitialHtml = (state) => {
  return `<div class="content">
          <header>
            <div class="header-title">
              <h1>Tiny Blog</h1>
            </div>
            <div class="header-buttons">
              <div><button id="settings" class="blog-button" title="Settings"><i class="fas fa-cog"></i></div>
            </div>
          </header>
          <div class="blog-form">
              <div class="blog-form__group">
                  <label class="blog-label">Title:</label>
                  <input type="text" class="blog-title blog-textfield" />
              </div>
              <div class="blog-form__group">
                  <label class="blog-label">Content:</label>
                  <div class="blog-content">
                    <textarea id="editor"></textarea>
                  </div>
              </div>
              <footer>
                  <button id="save" class="blog-button blog-button__primary">Save</button>
                  <div>
                    <div class="blog-button-group">
                        <label>Skin:</label>
                        <input type="radio" name="skin" value="default" ${state.settings.skin === 'default' ? 'checked' : ''}> Default
                        <input type="radio" name="skin" value="dark" ${state.settings.skin === 'dark' ? 'checked' : ''}> Dark
                    </div>
                    <div class="blog-button-group">
                        <label>Mode:</label>
                        <input type="radio" name="mode" value="basic" ${state.settings.mode === 'basic' ? 'checked' : ''}> Basic
                        <input type="radio" name="mode" value="full" ${state.settings.mode === 'full' ? 'checked' : ''}> Full
                    </div>
                  </div>
              </footer>
          </div>
      </div>`;
};

const populateState = async (mode, skin) => {
  const existingBlogs = await loadBlogs();
  return {
    data: {
      blogs: existingBlogs
    },
    settings: {
      skin: skin || 'default',
      mode: mode || 'basic',
      ...loadSettings()
    },
    editing: false,
    editId: null,
    eventDispatcher: new EventDispatcher()
  };
};

const changeSkin = async (state, skin) => {
  // Remove any current classes for the skin
  document.body.classList.remove('dark');

  // Set the new skin and add the dark class if we're running in dark mode
  state.settings.skin = skin;
  if (state.settings.skin === 'dark') {
    document.body.classList.add('dark');
  }
  saveSettings(state.settings);

  // Replace the editor
  if (state.editor) {
    const editorSkin = state.settings.skin === 'dark' ? 'oxide-dark' : 'oxide';
    state.editor = await editorUtils.replace(state.editor, state.settings.mode, editorSkin);
  }

  // Notify that we've changed the skin
  state.eventDispatcher.trigger('skinChanged', [{ skin }]);
};

const changeMode = async (state, mode) => {
  state.settings.mode = mode;
  saveSettings(state.settings);

  // Replace the editor
  if (state.editor) {
    const editorSkin = state.settings.skin === 'dark' ? 'oxide-dark' : 'oxide';
    state.editor = await editorUtils.replace(state.editor, state.settings.mode, editorSkin);
  }

  // Notify that we've changed the mode
  state.eventDispatcher.trigger('modeChanged', [{ mode }]);
};

/**
 * Initialize and setup the Tiny Blog application. This will find the element with the
 * `blogApp` id and initialize the application inside that element.
 *
 * @param mode The mode to load the blog editor in. [basic|full]
 * @param skin The skin to load the editor as. [default|dark]
 */
const BlogsApp = async (mode, skin) => {
  // Setup the blog app state
  const state = await populateState(mode, skin);

  // Update the blog app skin
  await changeSkin(state, state.settings.skin);

  // Setup the root element, by adding the 'blogApp' class to allow styling and
  // set the app as hidden for now until loading completes
  const blogAppEle = document.getElementById('blogApp');
  blogAppEle.classList.add('blogApp');
  blogAppEle.style.visibility = 'hidden';

  // Create the app content/HTML
  blogAppEle.innerHTML = buildInitialHtml(state);

  // Add the blogs container
  const blogsEle = document.createElement('div');
  blogsEle.classList.add('blogs');
  blogsEle.innerHTML = '<div class="no-blogs">No posts</div>';
  blogAppEle.appendChild(blogsEle);

  // Load any previously saved blogs
  addBlogsToDOM(state, blogsEle);

  // Load the TinyMCE editor
  const editorSkin = state.settings.skin === 'dark' ? 'oxide-dark' : 'oxide';
  state.editor = await editorUtils.load(state.settings.mode, editorSkin);

  // Bind to click events on the save button
  const saveElm = document.getElementById('save');
  saveElm.addEventListener('click', () => save(state));

  // Bind the radio button change events for the skin and mode
  const changeHandler = (name, e) => {
    if (e.target.checked) {
      blogAppEle.style.visibility = 'hidden';
      switch (name) {
        case 'skin':
          changeSkin(state, e.target.value);
          break;
        case 'mode':
          changeMode(state, e.target.value);
          break;
      }
      blogAppEle.style.visibility = 'visible';
    }
  };
  bindToggleChange('skin', changeHandler);
  bindToggleChange('mode', changeHandler);

  // The app is fully loaded now, so make it visible
  blogAppEle.style.visibility = 'visible';

  // Get the blog title element and focus it to make it easier to get started
  // adding a new blog entry
  const titleEle = document.querySelector('.blogApp .blog-title');
  titleEle.focus();

  // Trigger that the app is initialized
  state.eventDispatcher.trigger('init');

  return {
    addBlog: (title, content) => createBlog(state, title, content),
    getBlogs: () => ({ ...state.data.blogs }),
    deleteBlog: (index) => deleteBlog(state, index),
    on: (name, cb) => state.eventDispatcher.on(name, cb)
  };
};

export {
  BlogsApp
};