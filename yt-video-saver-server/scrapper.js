const puppeteer = require('puppeteer')

module.exports = async function puppeteerScrapper(videoId) {
  try {
    // Declare variable for video information
    let videoInfo
    // Initialize url
    let url = `https://www.youtube.com/watch?v=${videoId}`
    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    // Set the viewport size for the page
    await page.setViewport({ width: 1280, height: 800 });
    // Navigate the page to a URL
    await page.goto(url);
    // Get the video info
    videoInfo = await page.evaluate(() => {
      let tags = []
      let tagsElems = document.querySelectorAll('meta[property="og:video:tag"]')
      for (let tagsElem of tagsElems) {
        tags.push(tagsElem.content)
      }
      return {
        url: document.querySelector('meta[property="og:url"]').content,
        title: document.querySelector('meta[property="og:title"]').content,
        description: document.querySelector('meta[property="og:description"]').content,
        uploadedOn: document.querySelector('meta[itemprop="uploadDate"]').content,
        publishedOn: document.querySelector('meta[itemprop="datePublished"]').content,
        thumbnail: document.querySelector('meta[property="og:image"]').content,
        tags: tags,
        // keywords: document.querySelector('meta[name="keywords"]').content,
        embedUrl: document.querySelector('meta[property="og:video:url"]').content,
        views: document.querySelector('meta[itemprop="interactionCount"]').content,
        isFamilyFriendly: document.querySelector('meta[itemprop="isFamilyFriendly"]').content,
        requiresSubscription: document.querySelector('meta[itemprop="requiresSubscription"]').content,
        identifier: document.querySelector('meta[itemprop="identifier"]').content,
        length: document.querySelector('meta[itemprop="duration"]').content,
        category: document.querySelector('meta[property="og:type"]').content,
      }
    });
    console.log('videoInfo: ', videoInfo)
    // Close the browser
    browser.close()
    // Return the video info
    return videoInfo
  } catch (error) {
    // Handle any errors
    console.log(error)
    // Return an error message
    return error
  }
}