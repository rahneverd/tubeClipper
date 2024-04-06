
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "callApi") {
    const variableValue = message.videoURL;
    console.log(variableValue)

    function callApi(url) {
      navigator.clipboard.writeText(url).then(
        () => {
          console.log(url)
          console.log("Text successfully copied and calling api.");
          let apiCall = new XMLHttpRequest();
          apiCall.open("POST", `http:localhost:3000/save?url=${url}`);
          apiCall.send();
           apiCall.onload = () => {
            console.log(apiCall.response)
            window.alert('Added Successfully')
          }
          // 
        },
        (err) => {
          console.error("Failed to copy text to clipboard", err);
        }
      );

    }

    // Copy the received value to clipboard and call api
    callApi(variableValue)
  }
});