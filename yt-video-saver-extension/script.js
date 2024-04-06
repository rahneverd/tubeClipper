
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "copyToClipboardAndSave") {
    const variableValue = message.videoID;
    console.log(variableValue)

    function callApi(videoId) {
      navigator.clipboard.writeText(videoId).then(
        () => {
          console.log(videoId)
          console.log("Text successfully copied and calling api.");
          let apiCall = new XMLHttpRequest();
          apiCall.open("POST", `http:localhost:3000/save?url=${videoId}`);
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