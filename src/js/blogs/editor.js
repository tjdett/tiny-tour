const basicConfig = {
  menubar: false
};
const fullConfig = {
  plugins: 'image lists media table help',
  toolbar: 'image lists media table help'
};

const load = (mode, skin) => {
  console.log(skin);
  const config = mode === 'full' ? fullConfig: basicConfig;
  return tinymce.init({
    ...config,
    selector: '#editor',
    skin: skin || 'oxide'
  }).then((editors) => editors[0]);
};

const reset = (editor) => {
  editor.setContent('');
  editor.undoManager.clear();
  editor.undoManager.add();
  editor.setDirty(false);
};

const populate = (editor, content) => {
  editor.setContent(content);
  editor.undoManager.add();
  editor.setDirty(true);
}

export {
  load,
  reset,
  populate
}