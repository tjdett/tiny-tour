declare const tinymce: any;

interface ElementConfig {
  helpUrl?: string;
  helpHtml?: string;
  buttons?: string[];
  onAction?: (api: any) => void;
  onClose?: () => void;
  onSubmit?: (api: any) => void;
}

interface Config {
  bind?: Record<string, ElementConfig>;
  help?: Record<string, ElementConfig>;
}

const init = (config: Config) => {
  const bindActionOverlays = () => {
    // Bind the relevant help elements
    for (const selector of Object.keys(config.bind)) {
      const elmConfig = config.bind[selector];
      const elements = document.querySelectorAll<HTMLElement>(selector);
      elements.forEach((elm) => {
        bindOverlayElement(elm, elmConfig);
      });
    }
  };

  const showHelpOverlays = () => {
    const overlays: { elm: HTMLElement, config: ElementConfig }[] = [];

    // Build the root element
    const wrapper = buildRoot();
    document.body.appendChild(wrapper);

    const clickHandler = (e) => {
      overlays.forEach((overlay) => {
        const elementPosition = overlay.elm.getBoundingClientRect();
        if (e.clientX >= elementPosition.left &&
          e.clientX <= elementPosition.right &&
          e.clientY >= elementPosition.top &&
          e.clientY <= elementPosition.bottom) {
          openDialog(overlay.config);
        }
      })
    };

    // Build the blocker element
    const blocker = buildBlocker();
    blocker.addEventListener('click', clickHandler);
    document.body.appendChild(blocker);

    const close = buildBlockerClose(() => {
      blocker.removeEventListener('click', clickHandler);
      blocker.parentNode.removeChild(blocker);
      wrapper.parentNode.removeChild(wrapper);
      overlays.forEach((overlay) => {
        restoreElement(overlay.elm);
      });
    });
    blocker.appendChild(close);

    // Bind the relevant help elements
    for (const selector of Object.keys(config.help)) {
      const elmConfig = config.help[selector];
      const elements = document.querySelectorAll<HTMLElement>(selector);
      elements.forEach((elm) => {
        overlayElement(elm);
        overlays.push({ elm, config: elmConfig });
      });
    }
  };

  const buildRoot = (zIndex: number = 101): HTMLElement => {
    const root = document.createElement('div');
    root.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
    root.style.position = 'fixed';
    root.style.left = '0';
    root.style.right = '0';
    root.style.top = '0';
    root.style.bottom = '0';
    root.style.zIndex = '' + zIndex;
    return root;
  };

  const buildBlocker = (zIndex: number = 103): HTMLElement => {
    const blocker = document.createElement('div');
    blocker.style.position = 'fixed';
    blocker.style.left = '0';
    blocker.style.right = '0';
    blocker.style.top = '0';
    blocker.style.bottom = '0';
    blocker.style.zIndex = '' + zIndex;

    return blocker;
  };

  const buildBlockerClose = (cb) => {
    const close = document.createElement('button');
    close.appendChild(document.createTextNode('X'));
    close.addEventListener('click', cb);
    close.style.fontWeight = 'bold';
    close.style.fontSize = '14px';
    close.style.position = 'fixed';
    close.style.right = '5px';
    close.style.top = '5px';
    close.style.padding = '5px 8px';
    close.style.borderRadius = '3px';
    close.style.backgroundColor = '#fff';
    return close;
  };

  const overlayElement = (element: HTMLElement) => {
    if (element.getAttribute('style')) {
      element.dataset.tinyPrevStyles = element.getAttribute('style');
    }
    element.style.backgroundColor = '#fff';
    element.style.zIndex = '102';
    element.style.border = '1px solid blue'
  };

  const restoreElement = (element: HTMLElement) => {
    element.setAttribute('style', element.dataset.tinyPrevStyles);
  };

  const bindOverlayElement = (element: HTMLElement, elmConfig: ElementConfig) => {
    element.addEventListener('click', () => {
      openDialog(elmConfig);
    });
  };

  const openDialog = (elmConfig: ElementConfig) => {
    const buttons = [];
    if (!elmConfig.buttons) {
      buttons.push({
        type: 'cancel',
        text: 'close',
        primary: true
      });
    } else {
      elmConfig.buttons.forEach((button) => {
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

    tinymce.activeEditor.windowManager.open({
      title: 'Tiny Tour',
      size: 'large',
      body: {
        type: 'panel',
        items: [
          {
            type: 'htmlpanel',
            html: elmConfig.helpUrl ? `<iframe style="width: 100%; height: 100%" src="${elmConfig.helpUrl}"></iframe>` :
                                      `<div>${elmConfig.helpHtml}</div>`
          }
        ]
      },
      onAction: elmConfig.onAction,
      onClose: elmConfig.onClose,
      onSubmit: elmConfig.onSubmit,
      buttons
    });
  };

  return {
    bindActionOverlays,
    showHelpOverlays
  }
};

export {
  init
};