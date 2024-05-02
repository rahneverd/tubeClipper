
const request = require('request')
const cheerio = require('cheerio');
const pretty = require("pretty");
const fs = require('fs')
module.exports = async function puppeteerScrapper(videoId) {
  return new Promise((resolve, reject) => {
    try {
      // Declare variable for video information
      let videoInfo
      // Initialize url
      let url = `https://www.youtube.com/watch?v=${videoId}`
      // Request video info from Youtube API
      request(url, function (error, response, html) {
        // Print the error if one occurred
        if (error) {
          console.error('error:', error);
          reject(error)
        }
        else {
          // Print the response status code if a response was received
          console.log('statusCode:', response && response.statusCode);
          // Parse the HTML with cheerio
          let $ = cheerio.load(html)
          // Get video info from Youtube API
          let channelData = ($('body > script').text()).split('"videoDetails":')[1].split('"annotations":')[0]
          videoInfo = {
            title: $('meta[property="og:title"]').attr('content'),
            description: $('meta[property="og:description"]').attr('content'),
            url: $('meta[property="og:url"]').attr('content'),
            thumbnail: $('meta[property="og:image"]').attr('content'),
            uploadedOn: $('meta[itemprop="uploadDate"]').attr('content'),
            publishedOn: $('meta[itemprop="datePublished"]').attr('content'),
            tags: $('meta[property="og:video:tag"]').attr('content'),
            keywords: $('meta[name="keywords"]').attr('content').split(','),
            embedUrl: $('meta[property="og:video:url"]').attr('content'),
            views: $('meta[itemprop="interactionCount"]').attr('content'),
            isFamilyFriendly: $('meta[itemprop="isFamilyFriendly"]').attr('content'),
            requiresSubscription: $('meta[itemprop="requiresSubscription"]').attr('content'),
            identifier: $('meta[itemprop="identifier"]').attr('content'),
            length: $('meta[itemprop="duration"]').attr('content'),
            category: $('meta[property="og:type"]').attr('content'),
            channelId: ($('body > script').text()).split('"videoDetails":')[1].split('"annotations":')[0].split('channelId":"')[1].split('"')[0],
            channelName: ($('body > script').text()).split('"videoDetails":')[1].split('"annotations":')[0].split('author":"')[1].split('"')[0],
            shortDescription: ($('body > script').text()).split('"videoDetails":')[1].split('"annotations":')[0].split('shortDescription":"')[1].split('"')[0],
          }
          // console.log(pretty($('#below').html()))
          fs.writeFile("tmp/test.html",(($('body > script').text()).split('"videoDetails":')[1].split('"annotations":')[0]), function(err) {
        //     fs.writeFile("tmp/test.html",channelData, function(err) {
              if(err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        }); 
          // Return video info to caller
          // console.log(JSON.parse(JSON.stringify(($('body > script').text()).split('"videoDetails":')[1].split('"annotations":')[0].replace('\n', ''))))
          // get()[0].Text
          console.log('oas cheerioObj: ', videoInfo)
          resolve(videoInfo)
        }
      });
    } catch (error) {
      // Handle any errors
      console.log(error)
      // Return an error message
      reject(error)
    }
  })

}