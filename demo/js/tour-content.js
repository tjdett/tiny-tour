window.addEventListener('load', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const skin = urlParams.get('skin');

  if (skin !== 'default') {
    document.body.classList.add(skin)
  }
});