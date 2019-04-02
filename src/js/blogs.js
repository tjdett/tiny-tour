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

export {
  createBlog
}