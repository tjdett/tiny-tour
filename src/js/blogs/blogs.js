const createBlog = (title, content) => {
  const blogEle = document.createElement('div');
  blogEle.classList.add('blog');

  const header = document.createElement('h2');
  header.innerText = title;

  const contentEle = document.createElement('div');
  contentEle.innerHTML = content;

  blogEle.appendChild(header);
  blogEle.appendChild(contentEle);

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
                <h2>Blog</h2>
                <div>
                    <p>Some content</p>
                </div>
            </div>
        </div>
    </div>`
};

export {
  createBlog,
  initApp
}