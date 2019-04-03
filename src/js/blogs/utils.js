/**
 * Sends data to a backend server.
 *
 * @param url The url to send the data to.
 * @param data The data to send.
 * @param method The HTTP method to use when sending the data.
 * @returns {Promise} The server response from sending the data.
 */
const sendServerRequest = async (url, data, method = "POST") => {
  return fetch(url, {
    method: method || "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    referrer: "no-referrer",
    body: JSON.stringify(data),
  })
    .then(response => response.length > 0 && response.json())
    .catch(error => console.error(error));
};

export {
  sendServerRequest
}