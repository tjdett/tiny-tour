import * as editor from "./editor.js";

const editBlog = (index) => {
  console.log('edit clicked', index);
};

const deleteBlog = (index) => {
  store.blogs.splice(index, 1);
  updateStorage();
  const blogsEle = document.querySelector('.blogApp .blogs');
  removeBlogsFromDOM(blogsEle);
  addBlogsToDOM(blogsEle);
};

/**
 * Creates a Edit, Delete, etc... action button for a single blog
 */
const createButton = (name, btnClasses, iconClasses) => {
  const editButton = document.createElement('button');
  editButton.className = 'blog-button ' + btnClasses;
  editButton.title = name;
  editButton.innerHTML = `<i class="${iconClasses}"></i>`;
  return editButton;
};

/**
 * Creates the wrapper and all buttons for a single blog
 */
const createBlogButtons = () => {
  // Create a wrapper to hold the buttons
  const buttonsEle = document.createElement('div');
  buttonsEle.className = 'blog-buttons';

  // Create the edit/delete button elements
  const editButton = createButton('Edit', 'blog-button__primary', 'far fa-edit');
  const deleteButton = createButton('Delete', 'blog-button__error', 'far fa-trash-alt');

  // Wire up the button actions
  const index = store.blogs.length - 1;
  editButton.addEventListener('click', () => editBlog(index));
  deleteButton.addEventListener('click', () => deleteBlog(index));

  // Add the buttons to the wrapper
  buttonsEle.appendChild(editButton);
  buttonsEle.appendChild(deleteButton);

  return  buttonsEle;
};

/**
 * Creates a blog entry and returns the built HTML for the title, content and action buttons
 *
 * @param title The title of the blog entry
 * @param content The HTML content of the blog entry
 */
const createBlog = (title, content) => {
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
  const buttonsEle = createBlogButtons();

  // Add all the newly created elements to dom
  innerEle.appendChild(header);
  innerEle.appendChild(contentEle);
  blogEle.appendChild(innerEle);
  blogEle.appendChild(buttonsEle);

  return blogEle;
};

let store = {
  blogs: [],
  wizardState: {
    step: 0
  },
};

const updateStorage = () => {
  window.localStorage.setItem('blogs', JSON.stringify(store.blogs));
};

/**
 * Adds a new blog.
 *
 * @param title The title of the blog entry
 * @param content The HTML content of the blog entry
 */
const addBlog = (title, content) => {
  store.blogs.push({title: title, body: content});
  updateStorage();
  const blogsEle = document.querySelector('.blogApp .blogs');
  removeBlogsFromDOM(blogsEle);
  addBlogsToDOM(blogsEle);
};

const addBlogsToDOM = (dom) => {
  store.blogs.forEach((blog) => {
    const blogEle = createBlog(blog.title, blog.body);
    dom.appendChild(blogEle);
  });
};

const removeBlogsFromDOM = (dom) => {
  while (dom.hasChildNodes()) {
    dom.removeChild(dom.lastChild);
  }
};

const save = (ed) => {
  // Get the blog title element
  const titleEle = document.getElementById('blog-title');

  // Get the data
  const title = titleEle.value;
  const content = ed.getContent();

  // Create the blog and add it to the blogs list
  if (title.length > 0 && content.length > 0) {
    addBlog(title, content);

    // Reset the blog input/editor
    titleEle.value = null;
    editor.reset(ed);
  }
};

const bindToggleChange = (name, changeHandler) => {
  const skinEles = document.querySelectorAll(`.blogApp input[name="${name}"]`);
  skinEles.forEach((ele) => {
    ele.addEventListener('change', (e) => changeHandler(name, e));
  })
};

const loadEditor = (mode, skin) => {
  // Load the editor
  editor.load(mode, skin).then((ed) => {
    // Bind to click events on the save button
    const saveElm = document.getElementById('save');
    saveElm.addEventListener('click', () => save(ed));

    // Bind to the radio button change events for the skin and mode
    const changeHandler = (name, e) => {
      if (e.target.checked) {
        ed.remove();
        window.localStorage.setItem('tiny-blog.' + name, e.target.value);
        window.location.reload();
      }
    };
    bindToggleChange('skin', changeHandler);
    bindToggleChange('mode', changeHandler);
  });
};

const buildInitialHtml = (mode, skin) => {
  return `<div class="content">
          <header>
              <h1>Tiny Blogs</h1>
              <div><button id="help" class="blog-button" title="Help"><i class="far fa-question-circle"></i></button></div>
          </header>
          <div class="blog-form">
              <div class="blog-form__group">
                  <label class="blog-label">Title:</label>
                  <input id="blog-title" type="text" class="blog-textfield" />
              </div>
              <div class="blog-form__group">
                  <label class="blog-label">Content:</label>
                  <textarea id="editor"></textarea>
              </div>
              <footer>
                  <button id="save" class="blog-button blog-button__primary">Save</button>
                  <div>
                    <div class="blog-button-group">
                        <label>Skin:</label>
                        <input type="radio" name="skin" value="oxide" ${skin === 'oxide' ? 'checked' : ''}> Default
                        <input type="radio" name="skin" value="oxide-dark" ${skin === 'oxide-dark' ? 'checked' : ''}> Dark
                    </div>
                    <div class="blog-button-group">
                        <label>Mode:</label>
                        <input type="radio" name="mode" value="basic" ${mode === 'basic' ? 'checked' : ''}> Basic
                        <input type="radio" name="mode" value="full" ${mode === 'full' ? 'checked' : ''}> Full
                    </div>
                  </div>
              </footer>
          </div>
      </div>`;
};

const initApp = (mode, skin) => {
  const blogAppEle = document.getElementById('blogApp');
  blogAppEle.classList.add('blogApp');

  // Add the dark class if we're running in dark mode
  if (skin === 'oxide-dark') {
    blogAppEle.classList.add('dark');
  }

  // Create the editor content
  blogAppEle.innerHTML = buildInitialHtml(mode, skin);

  // Add the blogs container
  const blogsEle = document.createElement('div');
  blogsEle.classList.add('blogs');
  blogAppEle.appendChild(blogsEle);

  const storage = window.localStorage;

  // Load the editor
  loadEditor(mode, skin);

  // Get the blog title element and focus it
  const titleEle = document.getElementById('blog-title');
  titleEle.focus();

  return {
    addBlog
  };
};

export {
  initApp,
  store
}