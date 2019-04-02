import { openDialog } from "./dialog.js";

/**
 * Initializes tour
 *
 * @param config The tour configuration
 */
const Tour = (config) => {
  let activeStepIndex = 0;
  let activeDialog;

  const hasNextStep = (stepIndex) => {
    return stepIndex < config.steps.length - 1;
  };

  const hasPrevStep = (stepIndex) => {
    return stepIndex > 0;
  };

  const showStep = (stepIndex) => {
    if (activeDialog) {
      activeDialog.close();
      activeDialog = null;
    }

    const step = {
      buttons: [],
      onAction: (api, data) => {
        switch (data.name) {
          case 'next':
            next();
            break;
          case 'prev':
            prev();
            break;
        }
      },
      ...config.steps[stepIndex]
    };

    // Setup the buttons
    if (hasPrevStep(stepIndex)) {
      buttons.push('prev');
    }
    if (hasNextStep(stepIndex)) {
      buttons.push('next')
    }

    activeDialog = openDialog(step);
  };

  const start = (stepIndex) => {
    activeStepIndex = stepIndex || 0;
    showStep(activeStepIndex);
  };

  const next = () => {
    if (hasNextStep(activeStepIndex)) {
      activeStepIndex += 1;
      showStep(activeStepIndex);
    } else {
      end();
    }
  };

  const prev = () => {
    if (hasPrevStep(activeStepIndex)) {
      activeStepIndex -= 1;
      showStep(activeStepIndex);
    } else {
      end();
    }
  };

  const end = () => {
    if (activeDialog) {
      activeDialog.close();
      activeDialog = null;
    }
  };

  const notify = (name) => {
    if (hasNextStep(activeStepIndex)) {
      const nextStep = config.steps[activeStepIndex + 1];
      if (nextStep.waitForEvent === name) {
        next();
      }
    }
  };

  return {
    start,
    end,
    next,
    prev,
    notify
  }
};

export {
  Tour
}