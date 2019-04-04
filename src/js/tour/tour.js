import Swal from 'sweetalert2';
import tippy from 'tippy.js';
import { openDialog } from "./dialog";

/**
 * Build the wizard step indicator to use in the dialog.
 *
 * @param steps The steps in the tour.
 * @param currentStepIndex The current step index.
 * @returns {string} The HTML to be used when rendering the tour dialog.
 */
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
  let currentSkin = config.skin || 'default';
  let bannerContainer;
  let activeTooltips = [];

  /**
   * Create the banner to notify the user what part of the tour they are up to and to add additional
   * details about what they should be doing.
   *
   * @returns {HTMLElement} The banner element
   */
  const renderBanner = () => {
    const banner = document.createElement('div');
    banner.classList.add('tour-banner');
    banner.innerHTML = `<div></div>
        <div class="tour-buttons">
            <button id="tour-help" class="tour-button">Need help?</button>
            <button id="tour-close" class="close-button"><i class="fas fa-times"></i></button>
        </div>`;

    // Add the banner to the dom, at the start of the body
    if (document.body.hasChildNodes()) {
      document.body.insertBefore(banner, document.body.firstChild);
    } else {
      document.body.appendChild(banner);
    }

    // Register the close button click handler
    const close = document.getElementById('tour-close');
    close.addEventListener('click', () => {
      if (!isComplete(activeStepIndex)) {
        // The tour isn't complete, so confirm the user wants to leave
        Swal.fire({
          title: 'Are you sure you want to leave the tour?',
          text: 'Your progress will be lost if you continue!',
          imageUrl: "",
          showCancelButton: true,
          confirmButtonColor: '#3498db',
          cancelButtonColor: '#d80606',
          confirmButtonText: 'Leave tour',
        }).then((result) => {
          if (result.value) {
            // End the tour and remove the banner
            end();
            banner.parentNode.removeChild(banner);
          }
        });
      } else {
        // Remove the banner
        banner.parentNode.removeChild(banner);
      }
    });

    // Register the help/resume button click handler
    const help = document.getElementById('tour-help');
    help.addEventListener('click', () => {
      // If we're resuming once the tour is completed, then we need to restart instead
      if (isComplete(activeStepIndex)) {
        restart();
      } else if (running) {
        resume();
      }
    });

    return banner;
  };

  /**
   * Update the banner message/content to match the current step details.
   *
   * @param stepIndex The index of the current step.
   */
  const updateBannerContent = (stepIndex) => {
    const helpEle = document.getElementById('tour-help');
    if (stepIndex < 0) {
      bannerContainer.firstChild.innerHTML = 'Welcome to the tour!';
      helpEle.innerText = 'Need help?';
    } else if (isComplete(stepIndex)) {
      bannerContainer.firstChild.innerHTML = 'Congratulations you\'ve completed the tour!';
      helpEle.innerText = 'Restart tour';
    } else {
      const step = config.steps[stepIndex];
      bannerContainer.firstChild.innerHTML = `Step ${stepIndex + 1}: ${step.details ? step.details : step.title}`;
      helpEle.innerText = 'Need help?';
    }
  };

  /**
   * Determines if the tour is complete based on the current step.
   *
   * @param stepIndex The index of the current step.
   * @returns {boolean} True if the tour is complete, otherwise false.
   */
  const isComplete = (stepIndex) => {
    return stepIndex >= config.steps.length;
  };

  /**
   * Determines if the tour has a next step based on the current step.
   *
   * @param stepIndex The index of the current step.
   * @returns {boolean} True if the tour has a next step, otherwise false.
   */
  const hasNextStep = (stepIndex) => {
    return stepIndex < config.steps.length - 1;
  };

  /**
   * Determines if the tour has a previous step based on the current step.
   *
   * @param stepIndex The index of the current step.
   * @returns {boolean} True if the tour has a previous step, otherwise false.
   */
  const hasPrevStep = (stepIndex) => {
    return stepIndex > 0;
  };

  /**
   * Update the tours current active step and save the step to local storage so if the user
   * closes the app they can resume.
   *
   * @param stepIndex The index of the current step.
   */
  const updateActiveStep = (stepIndex) => {
    activeStepIndex = stepIndex;
    storage.setItem('tiny-tour.step', JSON.stringify(stepIndex));
  };

  /**
   * Builds up the buttons to show in the dialog for the current step. The following buttons
   * will be included based on the step:
   *
   *  - Previous (previous step available)
   *  - Next (next step available and current step doesn't need to wait for an event)
   *  - Try it out (next step available, but current step needs to wait for an event)
   *  - End tour (no more steps available/at the end of the tour)
   *
   * @param stepIndex The index of the step to build the buttons for.
   * @returns {Array}
   */
  const buildStepButtons = (stepIndex) => {
    const step = config.steps[stepIndex];
    const buttons = [];

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
      if (step.proceedOnEvent) {
        buttons.push({
          type: 'custom',
          name: 'tryitout',
          text: 'Try it out',
          primary: true
        });
      } else {
        buttons.push({
          type: 'custom',
          name: 'next',
          text: 'Next',
          primary: true
        });
      }
    }

    if (isComplete(stepIndex + 1)) {
      // Add a button to end the tour early if the user wants
      buttons.push({
        type: 'custom',
        name: 'end',
        text: 'End tour',
        primary: true
      });
    }

    return buttons;
  };

  /**
   * Closes any active UI components that are shown for the current step (eg dialogs and tooltips)
   */
  const closeOpenTourItems = () => {
    if (activeDialog) {
      activeDialog.close();
      activeDialog = null;
    }
    activeTooltips.forEach((tooltip) => tooltip.destroy(true));
    activeTooltips = [];
  };

  /**
   * Closes any active UI components (eg dialog) and then shows any tooltips to guide the user
   * in what to try in the sample app.
   *
   * @param step The current step details.
   */
  const tryItOut = (step) => {
    closeOpenTourItems();
    if (step.tooltips) {
      step.tooltips.forEach((tooltip) => {
        const targetElm = document.querySelector(tooltip.target);
        const instance = tippy(targetElm, {
          arrow: true,
          content: tooltip.content,
          placement: tooltip.placement || 'bottom-end',
          theme: currentSkin === 'dark' ? 'light' : 'dark'
        });
        instance.show();
        activeTooltips.push(instance);
      })
    }
  };

  /**
   * Show a specific step in the tour and mark it as the current active step.
   *
   * @param stepIndex The index of the step to show.
   */
  const showStep = (stepIndex) => {
    // Close any active dialogs or tooltips
    closeOpenTourItems();

    // Get the step configuration
    const step = config.steps[stepIndex];

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
          case 'tryitout':
            tryItOut(step);
            break;
        }
      },
      wizardHtml: buildWizard(config.steps, activeStepIndex)
    };

    // Add in the skin mode to the query params
    dialogConfig.url += `?skin=${currentSkin}`;

    // Load the step dialog
    activeDialog = openDialog(dialogConfig);
  };

  /**
   * Starts the tour and adds the tour banner to the page.
   *
   * @param stepIndex An optional step index to start the tour at.
   */
  const start = (stepIndex) => {
    running = true;
    bannerContainer = renderBanner();

    // Update the banner text and then show the current step if we're not complete
    const index = stepIndex || activeStepIndex;
    updateBannerContent(index);
    if (!isComplete(index)) {
      showStep(index);
    }
  };

  /**
   * Proceed to the next step in the tour. If no more steps are available, then the tour will end.
   */
  const next = () => {
    if (hasNextStep(activeStepIndex)) {
      showStep(activeStepIndex + 1);
    } else {
      end();
    }
  };

  /**
   * Move back to the previous step in the tour. If no more steps are available, then the tour will end.
   */
  const prev = () => {
    if (hasPrevStep(activeStepIndex)) {
      showStep(activeStepIndex - 1);
    } else {
      end();
    }
  };

  /**
   * End the tour and update the banner to show the tour has completed.
   */
  const end = () => {
    closeOpenTourItems();
    updateActiveStep(config.steps.length);
    running = false;

    updateBannerContent(config.steps.length);
  };

  /**
   * Notify the tour that an event has occurred. If the event matches what the current step is waiting
   * on, then the tour will move to the next step.
   *
   * @param name The name of the event that has been triggered.
   */
  const notify = (name) => {
    if (running && hasNextStep(activeStepIndex)) {
      const currentStep = config.steps[activeStepIndex];
      if (currentStep.proceedOnEvent === name) {
        next();
      }
    }
  };

  /**
   * Restart the tour.
   */
  const restart = () => {
    running = true;
    showStep(0);
  };

  /**
   * Resume the tour from the current step.
   */
  const resume = () => {
    if (running) {
      showStep(activeStepIndex);
    }
  };

  /**
   * Change the skin currently being used by the tour.
   *
   * @param skin The name of the skin to use. [default|dark]
   */
  const changeSkin = (skin) => {
    currentSkin = skin;
    activeTooltips.forEach((tooltip) => {
      tooltip.set({
        theme: skin === 'dark' ? 'light' : 'dark'
      })
    })
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