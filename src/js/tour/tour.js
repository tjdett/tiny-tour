import { openDialog } from "./dialog.js";

const buildWizard = (steps, currentStepIndex) => {
  const stepsContent = steps.map((step, index) => {
    return `<div class="wizard-step${ index === currentStepIndex ? ' wizard-step-active' : ''}"><span class="wizard-step-number">${index + 1}</span></div>`
  });

  return `<div class="wizard">${stepsContent.join('')}</div>`
};

/**
 * Initializes tour
 *
 * @param config The tour configuration
 */
const Tour = (config) => {
  const storage = window.localStorage;
  let activeStepIndex = JSON.parse(storage.getItem('tiny-tour.step') || 0);
  let activeDialog;
  let running = false;
  let currentSkin = 'default';
  let bannerContainer;

  const initBanner = () => {
    const banner = document.createElement('div');
    banner.classList.add('tour-banner');
    banner.innerHTML = '<div></div><div><button id="help" class="tour-button" title="Help"><i class="far fa-question-circle"></i></button></div>';

    if (document.body.hasChildNodes()) {
      document.body.insertBefore(banner, document.body.firstChild);
    } else {
      document.body.appendChild(banner);
    }

    const help = document.getElementById('help');
    help.addEventListener('click', () => {
      resume();
    });

    return banner;
  };

  const updateBannerContent = (stepIndex) => {
    if (stepIndex < 0) {
      bannerContainer.firstChild.innerHTML = 'Welcome to the tour!';
    } else if (isComplete(stepIndex)) {
      bannerContainer.firstChild.innerHTML = 'Congratulations you\'ve completed the tour! To restart the tour, press the help button.';
    } else {
      const step = config.steps[stepIndex];
      bannerContainer.firstChild.innerHTML = `Step ${stepIndex + 1}: ${step.details ? step.details : step.title}`
    }
  };

  const isComplete = (stepIndex) => {
    return stepIndex >= config.steps.length;
  };

  const hasNextStep = (stepIndex) => {
    return stepIndex < config.steps.length - 1;
  };

  const hasPrevStep = (stepIndex) => {
    return stepIndex > 0;
  };

  const updateActiveStep = (stepIndex) => {
    activeStepIndex = stepIndex;
    storage.setItem('tiny-tour.step', JSON.stringify(stepIndex));
  };

  const buildStepButtons = (stepIndex) => {
    const buttons = [];

    // Add a button to end the tour early if the user wants
    buttons.push({
      type: 'custom',
      name: 'end',
      text: 'End tour',
      primary: !hasNextStep(stepIndex)
    });

    // Add a previous button if a previous step exists
    if (hasPrevStep(stepIndex)) {
      buttons.push({
        type: 'custom',
        name: 'prev',
        text: 'Previous'
      });
    }

    // Add a next button if a next step exists
    if (hasNextStep(stepIndex)) {
      buttons.push({
        type: 'custom',
        name: 'next',
        text: 'Next',
        primary: true
      });
    }

    return buttons;
  };

  const showStep = (stepIndex, ignoreWait) => {
    // Close any active dialogs
    if (activeDialog) {
      activeDialog.close();
      activeDialog = null;
    }

    // Get the step configuration
    const step = config.steps[stepIndex];

    // Skip doing anything if the step needs to wait for an event
    if (step.waitForEvent && !ignoreWait) {
      return;
    }

    // Update the active step data
    updateActiveStep(stepIndex);

    // Update the banner content
    updateBannerContent(stepIndex);

    // Build up the dialog configuration
    const dialogConfig = {
      ...step,
      buttons: buildStepButtons(stepIndex),
      onAction: (api, data) => {
        switch (data.name) {
          case 'next':
            next();
            break;
          case 'prev':
            prev();
            break;
          case 'end':
            end();
            break;
        }
      },
      wizardHtml: buildWizard(config.steps, activeStepIndex)
    };

    // Load the step dialog
    activeDialog = openDialog(dialogConfig);
  };

  const start = (stepIndex) => {
    running = true;
    bannerContainer = initBanner();

    // Update the banner text and then show the current step if we're not complete
    const index = stepIndex || activeStepIndex;
    updateBannerContent(index);
    if (!isComplete(index)) {
      showStep(index, true);
    }
  };

  const next = () => {
    if (hasNextStep(activeStepIndex)) {
      showStep(activeStepIndex + 1);
    } else {
      end();
    }
  };

  const prev = () => {
    if (hasPrevStep(activeStepIndex)) {
      showStep(activeStepIndex - 1, true);
    } else {
      end();
    }
  };

  const end = () => {
    if (activeDialog) {
      activeDialog.close();
      activeDialog = null;
    }
    updateActiveStep(config.steps.length);
    running = false;

    updateBannerContent(config.steps.length);
  };

  const notify = (name) => {
    if (running && hasNextStep(activeStepIndex)) {
      const nextStep = config.steps[activeStepIndex + 1];
      if (nextStep.waitForEvent === name) {
        showStep(activeStepIndex + 1, true);
      }
    }
  };

  const restart = () => {
    running = true;
    showStep(0);
  };

  const resume = () => {
    // If we're resuming once the tour is completed, then just restart instead
    if (isComplete(activeStepIndex)) {
      restart();
    } else if (running) {
      showStep(activeStepIndex, true);
    }
  };

  const changeSkin = (skin) => {
    currentSkin = skin;
  };

  return {
    start,
    end,
    next,
    prev,
    notify,
    resume,
    restart,
    changeSkin
  }
};

export {
  Tour
}