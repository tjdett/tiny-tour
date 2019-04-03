const openDialog = (config) => {
  const buttons = [];
  if (!config.buttons) {
    buttons.push({
      type: 'cancel',
      text: 'Close',
      primary: true
    });
  } else {
    buttons.push(...config.buttons);
  }

  // Hack needed to get the iframe in the TinyMCE dialog to take up the full height
  tinymce.activeEditor.once('OpenWindow', () => {
    const iframe = document.querySelector('.tox-dialog .tox-form__group iframe');
    iframe.parentNode.style.height = '100%';
  });

  return tinymce.activeEditor.windowManager.open({
    title: 'Tiny Tour',
    size: 'large',
    body: {
      type: 'panel',
      items: [
        {
          type: 'htmlpanel',
          html: config.wizardHtml
        },
        {
          type: 'htmlpanel',
          html: config.helpUrl ? `<iframe style="width: 100%; height: 100%" src="${config.helpUrl}"></iframe>` :
            `<div>${config.helpHtml}</div>`
        }
      ]
    },
    onAction: config.onAction,
    onClose: config.onClose,
    onSubmit: config.onSubmit,
    buttons
  });
};

export {
  openDialog
}