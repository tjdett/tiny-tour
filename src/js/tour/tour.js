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
  let activeStepIndex = -1;
  let activeDialog;
  let running = false;

  const hasNextStep = (stepIndex) => {
    return stepIndex < config.steps.length - 1;
  };

  const hasPrevStep = (stepIndex) => {
    return stepIndex > 0;
  };

  const buildStepButtons = (stepIndex) => {
    const buttons = [];

    if (hasPrevStep(stepIndex)) {
      buttons.push({
        type: 'custom',
        name: 'prev',
        text: 'Previous'
      });
    }
    if (hasNextStep(stepIndex)) {
      buttons.push({
        type: 'custom',
        name: 'next',
        text: 'Next',
        primary: true
      });
    }

    buttons.push({
      type: 'custom',
      name: 'end',
      text: 'End tour',
      primary: !hasNextStep(stepIndex)
    });

    return buttons;
  };

  const showStep = (stepIndex, ignoreWait) => {
    if (activeDialog) {
      activeDialog.close();
      activeDialog = null;
    }

    const step = config.steps[stepIndex];

    if (step.waitForEvent && !ignoreWait) {
      return;
    }

    activeStepIndex = stepIndex;

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

    activeDialog = openDialog(dialogConfig);
  };

  const start = (stepIndex) => {
    running = true;
    showStep(stepIndex || 0);
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

  const resume = () => {
    if (running) {
      showStep(activeStepIndex, true);
    }
  };

  return {
    start,
    end,
    next,
    prev,
    notify,
    resume
  }
};

export {
  Tour
}