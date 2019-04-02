const createBlog = (title, content) => {
  const blogEle = document.createElement('div');
  blogEle.classList.add('blog');

  const innerEle = document.createElement('div');
  innerEle.className = 'inner';

  const header = document.createElement('h2');
  header.innerText = title;

  const contentEle = document.createElement('div');
  contentEle.innerHTML = content;

  const buttonsEle = document.createElement('div');
  const editButton = document.createElement('button');
  editButton.className = 'blog-button blog-button__primary';
  editButton.innerHTML = 'Edit';

  const deleteButton = document.createElement('button');
  deleteButton.className = 'blog-button blog-button__error';
  deleteButton.innerHTML = 'Delete';

  buttonsEle.appendChild(editButton);
  buttonsEle.appendChild(deleteButton);
  buttonsEle.className = 'blog-buttons';

  innerEle.appendChild(header);
  innerEle.appendChild(contentEle);
  blogEle.appendChild(innerEle);
  blogEle.appendChild(buttonsEle);

  return blogEle;
};

const initApp = () => {
  const blogAppEle = document.getElementById('blogApp');
  blogAppEle.innerHTML = `<div class="wrapper">
        <div class="content">
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
        </div>
        <div id="blogs">
            <div class="blog">
                <div class="inner">
                    <h2>Blog</h2>
                    <div>
                        <p>Some content</p>
                    </div>
                </div>
                <div class="blog-buttons">
                    <button class="blog-button blog-button__primary">edit</button>
                    <button class="blog-button blog-button__error">delete</button>
                </div>
            </div>
        </div>
    </div>`
};

export {
  createBlog,
  initApp
}