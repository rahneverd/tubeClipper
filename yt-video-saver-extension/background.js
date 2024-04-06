chrome.contextMenus.create({
  id: 'yt',
  title: 'Copy YouTube Video URL',
  contexts: ["all"],
  documentUrlPatterns: ['*://*.youtube.com/*']
});

function isYouTubeVideoUrl(url) {
  // Regular expressions to match YouTube video URLs
  const watchUrlPattern = /watch\?v=[A-Za-z0-9_-]{11}/;
  const shortsUrlPattern = /shorts\/[A-Za-z0-9_-]{11}/;

  return watchUrlPattern.test(url) || shortsUrlPattern.test(url);
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  let videoURL

  // If the link is a youtube video link, then copy it to videoURL
  if (isYouTubeVideoUrl(info.linkUrl)) videoURL = info.linkUrl
  
  // If the page is a youtube video page, then copy it to videoURL
  else if (isYouTubeVideoUrl(info.pageUrl)) videoURL = info.pageUrl

  // Note, we are checking the Link URL first, because in case the user clicks on a YouTube video link when they are already watching a YouTube video, the URL copied will not be of the clicked Link but of the current video being played, because we are checking for the page first. Therefore, instead of checking of the page first, we will check for the clicked LINK to see if it's a YouTube video link, if it's not, then it will check for the page URL. 
  


  else console.log("This is neither a youtube video page nor a youtube video link you have clicked on");

  // If we have got a videoURL, send it to the content script
  if (videoURL) chrome.tabs.sendMessage(tab.id, { action: "callApi", videoURL })

});