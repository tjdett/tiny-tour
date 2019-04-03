import * as editor from "./editor.js";
import EventDispatcher from "../../../node_modules/EventDispatcher/src/EventDispatcher.js";
// import axios from "../../../node_modules/axios/dist/axios.js";

/**
 * Creates a Edit, Delete, etc... action button for a single blog.
 */
const createButton = (name, btnClasses, iconClasses) => {
  const editButton = document.createElement('button');
  editButton.className = 'blog-button ' + btnClasses;
  editButton.title = name;
  editButton.innerHTML = `<i class="${iconClasses}"></i>`;
  return editButton;
};

/**
 * Creates the wrapper and all buttons for a single blog.
 */
const createBlogButtons = (store, index) => {
  // Create a wrapper to hold the buttons
  const buttonsEle = document.createElement('div');
  buttonsEle.className = 'blog-buttons';

  // Create the edit/delete button elements
  const editButton = createButton('Edit', 'blog-button__primary', 'far fa-edit');
  const deleteButton = createButton('Delete', 'blog-button__error', 'far fa-trash-alt');

  // Wire up the button actions
  editButton.addEventListener('click', () => editBlog(store, index));
  deleteButton.addEventListener('click', () => deleteBlog(store, index));

  // Add the buttons to the wrapper
  buttonsEle.appendChild(editButton);
  buttonsEle.appendChild(deleteButton);

  return  buttonsEle;
};

/**
 * Creates a blog entry and returns the built HTML for the title, content and action buttons.
 *
 * @param store The datastore for the blog details.
 * @param title The title of the blog entry.
 * @param content The HTML content of the blog entry.
 */
const createBlog = (store, title, content, index) => {
  // Create the wrapper element to hold all the blog details
  const blogEle = document.createElement('div');
  blogEle.classList.add('blog');

  // Create the blog header element
  const innerEle = document.createElement('div');
  innerEle.className = 'inner';

  // Create the blog header element
  const header = document.createElement('h2');
  header.innerText = title;

  // Create the blog content element
  const contentEle = document.createElement('div');
  contentEle.innerHTML = content;

  // Create the blog buttons
  const buttonsEle = createBlogButtons(store, index);

  // Add all the newly created elements to dom
  innerEle.appendChild(header);
  innerEle.appendChild(contentEle);
  blogEle.appendChild(innerEle);
  blogEle.appendChild(buttonsEle);

  return blogEle;
};

const updateStorage = (store) => {
  window.localStorage.setItem('tiny-blogs', JSON.stringify(store.data));
  // postData(`/articles/`, { title: title, content: content })
  //   .then(data => console.log(JSON.stringify(data))) // JSON-string from `response.json()` call
  //   .catch(error => console.error(error));

    // + store.data.blogs[store.data.blo]

};

const loadStorage = async (mode, skin) => {
// async function loadStorage(mode, skin) {
  console.log('Load storage');

  const fetched = await fetch('/articles/')
    .then(function(response) {
      if (response.status !== 200) {
        throw "load storage failed";
      }
      return response.json();
    })
    .then(function(myJson) {
      console.log(JSON.stringify(myJson.articles));
      return JSON.stringify({blogs: myJson.articles});
    });

  return fetched;
    
  // try {
  //   return JSON.parse(window.localStorage.getItem('tiny-blogs') || '{}');
  // } catch (e) {
  //   console.error(e);
  //   return {};
  // }
};

/**
 * Adds a new blog.
 *
 * @param store The datastore for the blog details.
 * @param title The title of the blog entry.
 * @param content The HTML content of the blog entry.
 */
const addBlog = (store, title, content) => {
  store.data.blogs.push({title: title, content: content});
  updateStorage(store);
  renderBlogs(store);

  postData(`/articles/`, { title: title, content: content })
    .then(data => console.log(JSON.stringify(data))) // JSON-string from `response.json()` call
    .catch(error => console.error(error));
};

const postData = (url, blog, method = "POST") => {
  return fetch(url, {
    method: method || "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
        "Content-Type": "application/json",
    },
    redirect: "follow",
    referrer: "no-referrer",
    body: JSON.stringify(blog),
  })
  .then(response => response.json());
}

/**
 * Loads a blog entry content/title back into the editable area so that it can
 * be updated.
 *
 * @param store The datastore for the blog details.
 * @param index The index of the blog to edit from the stores blog list.
 */
const editBlog = (store, index) => {
  if (store.editor) {
    editor.populate(store.editor, store.data.blogs[index].content);
    store.editing = true;
    store.editIndex = store.data.blogs[index].id;
    const titleEle = document.querySelector('.blogApp .blog-title');
    titleEle.value = store.data.blogs[index].title;

    store.eventDispatcher.trigger('edit');
  }
};

const confirmEdit = (store, title, content, index) => {
  store.data.blogs[index] = {title: title, content: content};
  postData(`/articles/` + store.editIndex, { title: title, content: content }, "PUT")
    .then(data => console.log(JSON.stringify(data))) // JSON-string from `response.json()` call
    .catch(error => console.error(error));
  updateStorage(store);
  renderBlogs(store);
};

/**
 * Deletes a blog at the specified index.
 *
 * @param store The datastore for the blog details.
 * @param index The index of the blog to delete from the stores blog list.
 */
const deleteBlog = (store, index) => {
  store.editIndex = store.data.blogs[index].id;
  const deleteIndex = store.data.blogs[index].id;
  postData(`/articles/` + deleteIndex, { title: "", content: "" }, "DELETE")
    .then(data => console.log(JSON.stringify(data))) // JSON-string from `response.json()` call
    .catch(error => console.error(error));
  store.data.blogs.splice(index, 1);
  updateStorage(store);
  renderBlogs(store);
};

// Re-populate blogs list following add/edit/remove
const renderBlogs = (store) => {
  const blogsEle = document.querySelector('.blogApp .blogs');
  removeBlogsFromDOM(blogsEle);
  addBlogsToDOM(store, blogsEle);
};

/**
 * Builds up the DOM representation for all blogs in the store and adds them
 * to the blogs DOM list.
 *
 * @param store The datastore for the blog details
 * @param dom The DOM element to add all the created blogs to
 */
const addBlogsToDOM = (store, dom) => {
  if (store.data.blogs.length > 0) {
    dom.innerHTML = '';
    store.data.blogs.forEach((blog, index) => {
      const blogEle = createBlog(store, blog.title, blog.content, index);
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
  dom.innerHTML = '<div class="no-blogs">No blogs</div>';
};

/**
 * Saves or updates a new blog entry.
 *
 * @param store The datastore for the blog details.
 * @param ed The current TinyMCE editor instance, that contains the blog contents.
 */
const save = (store, ed) => {
  // Get the blog title/editor element
  const titleEle = document.querySelector('.blogApp .blog-title');
  const editorEle = document.querySelector('.blogApp .blog-content');

  // Get the data
  const title = titleEle.value;
  const content = ed.getContent();

  // Create the blog and add it to the blogs list
  if (title.length > 0 && content.length > 0) {
    if (store.editing) {
      confirmEdit(store, title, content, store.editIndex);
    } else {
      addBlog(store, title, content);
    }
    store.editing = false;
    store.editIndex = 0;
    // Reset the blog input/editor
    titleEle.value = null;
    editor.reset(ed);

    store.eventDispatcher.trigger('save');
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
      ed.once('change', () => {
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
 * @param store The datastore for the blog details
 * @returns {string} The core application HTML.
 */
const buildInitialHtml = (store) => {
  return `<div class="content">
          <header>
            <div class="header-title">
              <h1>Tiny Blogs</h1>
            </div>
            <div class="header-buttons">
              <div><button id="settings" class="blog-button" title="Settings"><i class="fas fa-cog"></i></div>
              <div><button id="help" class="blog-button" title="Help"><i class="far fa-question-circle"></i></button></div>
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
                        <input type="radio" name="skin" value="default" ${store.data.skin === 'default' ? 'checked' : ''}> Default
                        <input type="radio" name="skin" value="dark" ${store.data.skin === 'dark' ? 'checked' : ''}> Dark
                    </div>
                    <div class="blog-button-group">
                        <label>Mode:</label>
                        <input type="radio" name="mode" value="basic" ${store.data.mode === 'basic' ? 'checked' : ''}> Basic
                        <input type="radio" name="mode" value="full" ${store.data.mode === 'full' ? 'checked' : ''}> Full
                    </div>
                  </div>
              </footer>
          </div>
      </div>`;
};

/**
 * Initialize and setup the Tiny Blog application. This will find the element with the
 * `blogApp` id and initialize the application inside that element.
 *
 * @param mode The mode to load the blog editor in. [basic|full]
 * @param skin The skin to load the editor as. [default|dark]
 */
const BlogsApp = async (mode, skin) => {
  const existingBlogs = await loadStorage();
  // Setup the blog app state/store
  const store = {
    data: {
      blogs: [],
      skin: skin || 'default',
      mode: mode || 'basic',
      ...JSON.parse(existingBlogs)
    },
    editing: false,
    editIndex: 0,
    eventDispatcher: new EventDispatcher()
  };

  // Setup the root element, by adding the 'blogApp' class to allow styling and
  // set the app as hidden for now until loading completes
  const blogAppEle = document.getElementById('blogApp');
  blogAppEle.classList.add('blogApp');
  blogAppEle.style.visibility = 'hidden';

  // Add the dark class if we're running in dark mode
  if (store.data.skin === 'dark') {
    blogAppEle.classList.add('dark');
    document.body.classList.add('dark');
  }

  // Create the app content/HTML
  blogAppEle.innerHTML = buildInitialHtml(store);

  // Add the blogs container
  const blogsEle = document.createElement('div');
  blogsEle.classList.add('blogs');
  blogsEle.innerHTML = '<div class="no-blogs">No blogs</div>';
  blogAppEle.appendChild(blogsEle);

  // Load any previously saved blogs
  addBlogsToDOM(store, blogsEle);

  // Load the TinyMCE editor
  const editorSkin = store.data.skin === 'dark' ? 'oxide-dark' : 'oxide';
  editor.load(store.data.mode, editorSkin).then((ed) => {
    // Bind to click events on the save button
    const saveElm = document.getElementById('save');
    saveElm.addEventListener('click', () => save(store, ed));
    store.editor = ed;

    // Bind the radio button change events for the skin and mode
    const changeHandler = (name, e) => {
      if (e.target.checked) {
        blogAppEle.style.visibility = 'hidden';
        ed.remove();
        store.data[name] = e.target.value;
        updateStorage(store);
        window.location.reload();
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
    store.eventDispatcher.trigger('init');
  });

  return {
    addBlog: (title, content) => addBlog(store, title, content),
    getBlogs: () => store.data.blogs.slice(0),
    deleteBlog: (index) => deleteBlog(store, index),
    on: (name, cb) => store.eventDispatcher.on(name, cb)
  };
};

export {
  BlogsApp
};