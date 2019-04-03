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