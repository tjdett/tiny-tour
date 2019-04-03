/**
 * The TinyMCE configuration for a very basic editor. This will be the configuration passed to
 * the `tinymce.init()` call when loading the editor in basic mode.
 */
const basicConfig = {
  // Disable the menubar so that only a toolbar is shown
  menubar: false
};

/**
 * The TinyMCE configuration for a fully featured editor. This will be the configuration passed
 * to the `tinymce.init()` call when loading the editor in full mode.
 */
const fullConfig = {
  plugins: 'image lists media table help',
  toolbar: 'image lists media table help'
};

/**
 * Loads a new editor.
 *
 * @param mode The mode to load the editor in. [basic|full]
 * @param skin The skin to use for the editor.
 * @returns Promise<Editor>
 */
const load = (mode, skin) => {
  const config = mode === 'full' ? fullConfig: basicConfig;
  return tinymce.init({
    ...config,
    selector: '#editor',
    skin: skin || 'oxide',
    height: 400
  }).then((editors) => editors[0]);
};

/**
 * Reset the editor state back to the initial state.
 *
 * @param editor The editor instance to reset.
 * @param content Optional content to reset the editor to.
 */
const reset = (editor, content = '') => {
  editor.setContent(content);
  editor.undoManager.clear();
  editor.undoManager.add();
  editor.setDirty(false);
};

export {
  load,
  reset
}