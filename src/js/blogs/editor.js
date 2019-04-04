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

// Hack to work around skin switching issues in TinyMCE
const toggleSkinCss = (skin, state) => {
  const stylesheets = document.querySelectorAll('head link[rel="stylesheet"]');
  stylesheets.forEach((stylesheet) => {
    if (stylesheet.href.indexOf(`${skin}/skin.min.css`) !== -1) {
      stylesheet.disabled = state;
    }
  })
};

/**
 * Loads a new editor.
 *
 * @param mode The mode to load the editor in. [basic|full]
 * @param skin The skin to use for the editor.
 * @returns Promise<Editor>
 */
const load = async (mode, skin) => {
  const config = mode === 'full' ? fullConfig: basicConfig;
  const editors = await tinymce.init({
    ...config,
    selector: '#editor',
    skin: skin || 'oxide',
    height: 400
  });

  // Enable the skin css if it was previously loaded, as TinyMCE doesn't clean up skin css currently
  // so we disable them in the remove call below
  toggleSkinCss(skin, false);

  return editors[0];
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

/**
 * Remove the editor from the page.
 *
 * @param editor The editor instance to be removed.
 */
const remove = (editor) => {
  // Remove the editor
  editor.remove();

  // Disable the loaded skin, as TinyMCE doesn't clean up skin css currently
  toggleSkinCss(editor.settings.skin, true);
};

/**
 * Replace an editor with new settings.
 *
 * @param editor The editor instance to be replaced.
 * @param mode The mode to load the editor in. [basic|full]
 * @param skin The skin to use for the editor.
 * @returns {Promise<Editor>}
 */
const replace = async (editor, mode, skin) => {
  // Store the current editor content, so we can restore it after loading the new editor
  const content = editor.getContent();

  // Remove the editor
  remove(editor);

  // Load the new editor and restore the content
  const newEditor = await load(mode, skin);
  reset(newEditor, content);

  return newEditor;
};

export {
  load,
  remove,
  reset,
  replace
}