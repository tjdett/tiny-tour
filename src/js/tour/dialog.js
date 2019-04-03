const openDialog = (config) => {
  const buttons = [];
  if (!config.buttons) {
    buttons.push({
      type: 'cancel',
      text: 'Close',
      primary: true
    });
  } else {
    config.buttons.forEach((button) => {
      switch (button) {
        case 'cancel':
          buttons.push({
            type: 'cancel',
            text: 'Close'
          });
          break;
        case 'submit':
          buttons.push({
            type: 'submit',
            text: 'Save',
            primary: true
          });
          break;
        case 'next':
          buttons.push({
            type: 'custom',
            name: 'next',
            text: 'Next'
          });
          break;
        case 'prev':
          buttons.push({
            type: 'custom',
            name: 'prev',
            text: 'Previous'
          });
          break;
      }
    });
  }

  return tinymce.activeEditor.windowManager.open({
    title: 'Tiny Tour',
    size: 'large',
    body: {
      type: 'panel',
      items: [
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