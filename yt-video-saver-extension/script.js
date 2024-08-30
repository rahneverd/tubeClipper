chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'copyToClipboardAndSave') {
    const variableValue = message.videoID;

    function callApi(videoId) {
      navigator.clipboard.writeText(videoId).then(
        () => {
          console.log('Text successfully copied and calling api.');
          const data = JSON.stringify({
            videoId: videoId,
            secretKey: 'your-secret-key'
          });
          let apiCall = new XMLHttpRequest();
          apiCall.open('POST', `http:localhost:5000/save?data=${data}`);
          apiCall.send();
          apiCall.onload = () => {
            console.log(apiCall.response);
            window.alert('Added Successfully');
          };
          //
        },
        (err) => {
          console.error('Failed to copy text to clipboard', err);
        }
      );
    }

    // Copy the received value to clipboard and call api
    callApi(variableValue);
  }
});
