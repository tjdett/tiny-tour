import * as editor from "./editor.js";

const editBlog = (index) => {
    console.log('edit clicked', index);
}

const deleteBlog = (index) => {
    store.blogs.splice(index, 1);
    updateStorage();
    const blogsEle = document.querySelector('.blogApp .blogs');
    removeBlogsFromDOM(blogsEle);
    addBlogsToDOM(blogsEle);
}

const createBlog = (title, content) => {
  const blogEle = document.createElement('div');
  blogEle.classList.add('blog');

  const innerEle = document.createElement('div');
  innerEle.className = 'inner';

  const header = document.createElement('h2');
  header.innerText = title;

  const contentEle = document.createElement('div');
  contentEle.innerHTML = content;

  const index = store.blogs.length - 1;
  const buttonsEle = document.createElement('div');
  const editButton = document.createElement('button');
  editButton.className = 'blog-button blog-button__primary';
  editButton.innerHTML = 'Edit';
  editButton.addEventListener('click', () => editBlog(index));

  const deleteButton = document.createElement('button');
  deleteButton.className = 'blog-button blog-button__error';
  deleteButton.innerHTML = 'Delete';
  deleteButton.addEventListener('click', () => deleteBlog(index));

  buttonsEle.appendChild(editButton);
  buttonsEle.appendChild(deleteButton);
  buttonsEle.className = 'blog-buttons';

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
}

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
}

const removeBlogsFromDOM = (dom) => {
  while (dom.hasChildNodes()) {
    dom.removeChild(dom.lastChild);
  }
}

const save = (ed) => {
  // Get the blog title element
  const titleEle = document.getElementById('blog-title');

  // Create the blog and add it to the blogs list
  if (titleEle.value.length > 0 && ed.getContent().length > 0) {
    addBlog(titleEle.value, ed.getContent());

    // Reset the blog input/editor
    titleEle.value = null;
    editor.reset(ed);
  }
};

const initApp = (mode) => {
  const blogAppEle = document.getElementById('blogApp');
  blogAppEle.classList.add('blogApp');

  // Create the editor content
  blogAppEle.innerHTML = `<div class="content">
      <header>
          <h1>Tiny Blogs</h1>
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
              <button id="help" class="blog-button">Help</button>
          </footer>
      </div>
  </div>`;

  // Add the blogs container
  const blogsEle = document.createElement('div');
  blogsEle.classList.add('blogs');
  blogAppEle.appendChild(blogsEle);

  const storage = window.localStorage;

  // Load the editor
  editor.load(mode).then((ed) => {
    // Register the save click event
    const saveElm = document.getElementById('save');
    saveElm.addEventListener('click', () => save(ed));
  });
};

export {
  addBlog,
  initApp,
  store
}