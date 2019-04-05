/**
 * The TinyMCE configuration for a very basic editor. This will be the configuration passed to
 * the `tinymce.init()` call when loading the editor in basic mode.
 */
const basicConfig = {
  // Disable the menubar so that only a toolbar is shown
  menubar: false
};

/**
 * The TinyMCE configuration for a nearly fully featured editor. This will be the configuration passed
 * to the `tinymce.init()` call when loading the editor in full mode.
 */
const advancedConfig = {
  // The plugins that TinyMCE should use. Plugins provide extra functionality to TinyMCE outside of the core editing
  // that basic mode provides.  Plugins can either be a list of names separated by spaces, or an array of space
  // separated names like below.
  plugins: [ 'print preview searchreplace autolink directionality visualblocks visualchars fullscreen image',
             'link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime',
             'advlist lists wordcount imagetools textpattern help',
             // Premium plugins
             'a11ychecker advcode powerpaste tinymcespellchecker'],

  // The toolbar buttons that should be shown in the editor. Toolbars can be broken into groups by adding a
  // pipe character "|" between the toolbar button names.
  toolbar: 'bold italic strikethrough forecolor backcolor | formatselect fontselect fontsizeselect | ' +
           'alignleft aligncenter alignright alignjustify | numlist bullist outdent indent | link image media | ' +
           'code pastetext | removeformat',

  // Enable the more drawer feature to collapse the toolbar if it wraps
  // The 2 modes for more drawer are 'floating' and 'sliding'
  toolbar_drawer: 'floating',

  // Link plugin configuration
  link_list: [
    { title: 'TinyMCE', value: 'http://www.tinymce.com' },
    { title: 'Moxiecode', value: 'http://www.moxiecode.com' }
  ],

  // Image plugin configuration
  image_advtab: true,                                     // Show the advanced tab in the insert image dialog
  image_caption: true,                                    // Show the caption option in the insert image dialog
  image_list: [
    { title: 'TinyMCE', value: 'http://www.tinymce.com' },
    { title: 'Moxiecode', value: 'http://www.moxiecode.com' }
  ],

  // Template plugin configuration
  templates: [
    { title: 'Example 1', content: 'My content' },
    { title: 'Example 2', content: '<div class="mceTmpl"><span class="cdate">cdate</span><span class="mdate">mdate</span>My content2</div>' }
  ],
  template_cdate_format: '[CDATE: %m/%d/%Y : %H:%M:%S]',  // Date format for 'created' dates
  template_mdate_format: '[MDATE: %m/%d/%Y : %H:%M:%S]',  // Date format for 'modified' dates

  // TinyMCE premium spellchecker plugin configuration
  spellchecker_dialog: false,                             // Use as you type spellchecking instead of a dialog
  spellchecker_whitelist: ['Ephox', 'Moxiecode'],         // Add "Ephox" and "Moxiecode" as whitelisted words

  // PowerPaste premium plugin configuration
  powerpaste_word_import: 'clean',                        // Clean all formatting when pasting from word
  powerpaste_html_import: 'merge'                         // Merge formatting when pasting regular HTML
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

// Quick way to have a "partial" dynamic height for the editor based on the viewport height
const getInitialEditorHeight = () => {
  if (window.innerHeight > 900) {
    return 600;
  } else if (window.innerHeight > 800) {
    return 500;
  } else if (window.innerHeight > 700) {
    return 400;
  } else {
    return 350;
  }
};

/**
 * Loads a new editor.
 *
 * @param mode The mode to load the editor in. [basic|full]
 * @param skin The skin to use for the editor.
 * @returns Promise<Editor>
 */
const load = async (mode, skin) => {
  const config = mode === 'advanced' ? advancedConfig: basicConfig;
  const editors = await tinymce.init({
    ...config,
    selector: '#editor',
    skin: skin || 'oxide',
    height: getInitialEditorHeight()
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
  editor.nodeChanged();
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
  const bookmark = editor.selection.getBookmark(3);

  // Remove the editor
  remove(editor);

  // Load the new editor and restore the content/selection
  const newEditor = await load(mode, skin);
  setTimeout(() => {
    reset(newEditor, content);
    newEditor.selection.moveToBookmark(bookmark);
  }, 0);

  return newEditor;
};

export {
  load,
  remove,
  reset,
  replace
}