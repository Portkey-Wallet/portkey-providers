const { shouldInjectProvider } = require('@portkey/provider-utils');

/* global inpageBundle */

if (shouldInjectProvider()) {
  injectScript(inpageBundle);
  start();
}

// Functions

/**
 * Sets up the stream communication and submits site metadata
 *
 */
async function start() {
  await domIsReady();
}

/**
 * Injects a script tag into the current document
 *
 * @param {string} content - Code to be executed in the current document
 */
function injectScript(content) {
  try {
    const container = document.head || document.documentElement;

    // synchronously execute script in page context
    const scriptTag = document.createElement('script');
    scriptTag.setAttribute('async', false);
    scriptTag.textContent = content;
    container.insertBefore(scriptTag, container.children[0]);

    // script executed; remove script element from DOM
    container.removeChild(scriptTag);
  } catch (err) {
    console.error('MetaMask script injection failed', err);
  }
}

/**
 * Returns a promise that resolves when the DOM is loaded (does not wait for images to load)
 */
async function domIsReady() {
  // already loaded
  if (['interactive', 'complete'].includes(document.readyState)) {
    return;
  }
  // wait for load
  await new Promise((resolve) =>
    window.addEventListener('DOMContentLoaded', resolve, { once: true }),
  );
}
