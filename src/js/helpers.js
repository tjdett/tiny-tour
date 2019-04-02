const basicConfig = {
  menubar: false
};
const fullConfig = {
  plugins: 'image list media table help'
};

const load = (mode) => {
  const config = mode === 'full' ? fullConfig: basicConfig;
  return tinymce.init({
    selector: '#editor',
    ...config
  });
};

export {
  load
}