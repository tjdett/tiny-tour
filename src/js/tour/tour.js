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
    const index = stepIndex || activeStepIndex;
    if (index <= config.steps.length) {
      showStep(index);
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
      showStep(activeStepIndex - 1);
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
    showStep(0);
  };

  const resume = () => {
    if (running) {
      // If we're resuming once the tour is completed, then just restart instead
      if (activeStepIndex >= config.steps.length) {
        restart();
      } else {
        showStep(activeStepIndex, true);
      }
    }
  };

  return {
    start,
    end,
    next,
    prev,
    notify,
    resume,
    restart
  }
};

export {
  Tour
}