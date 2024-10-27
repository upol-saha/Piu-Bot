const axios = require("axios");
const fs = require("fs-extra");
const yts = require('yt-search');
const ytdl = require('@distube/ytdl-core');
module.exports = {
  config: {
    name: "vs",
    version: "1.5",
    author: "UPoL",
    category: "music",
    dependencies: {
      "fs-extra": "",
      "axios": "",
      "@distube/ytdl-core": "",
      "yt-search": ""
    }
  },

  onStart: async ({ api, event }) => {
    const input = event.body;
    const text = input.substring(12);
    const data = input.split(" ");
    const command = data[1];
    data.splice(0, 2);

    if (data.length < 1) {
      return api.sendMessage("My apologies, but could you please provide a title?", event.threadID);
    }

    const query = data.join(" ");

    try {
      if (command === "-s" || command === "-sing") {
        // Audio
        api.setMessageReaction("⏳", event.messageID, event.messageID, api);

        const searchMessage = await api.sendMessage(`🔍 | Please wait...`, event.threadID);

        const searchResults = await yts(query);
        if (!searchResults.videos.length) {
          api.unsendMessage(searchMessage.messageID); 
          api.sendMessage("Apologies, but I couldn't find any relevant results.", event.threadID, event.messageID);
        }

        const music = searchResults.videos[0];
        const musicUrl = music.url;

        const stream = ytdl(musicUrl, { filter: "audioonly" });

        const fileName = `${event.senderID}.mp3`;
        const filePath = __dirname + `/cache/${fileName}`;

        stream.pipe(fs.createWriteStream(filePath));

        stream.on('response', () => {
          console.info('[DOWNLOADER]', 'Commencing download...');
        });

        stream.on('info', (info) => {
          console.info('[DOWNLOADER]', `Downloading music: ${info.videoDetails.title}`);
        });

        stream.on('end', async () => {
          console.info('[DOWNLOADER] Download completed.');

          if (fs.statSync(filePath).size > 26214400) {
            fs.unlinkSync(filePath);
            api.unsendMessage(searchMessage.messageID); 
            return api.sendMessage('Apologies, the file exceeds 25MB and cannot be sent.', event.threadID);
          }

          const message = {
            body: `Here is your requested music. Enjoy!🎵\n\nTitle: ${music.title}\nDuration: ${music.duration.timestamp}`,
            attachment: fs.createReadStream(filePath)
          };

          api.unsendMessage(searchMessage.messageID); 

          api.setMessageReaction("🎶", event.messageID, event.messageID, api);

          api.sendMessage(message, event.threadID, () => {
            fs.unlinkSync(filePath);
          });
        });

      } else if (command === "-v" || command === "-video") {
        
        api.setMessageReaction("", event.messageID, event.messageID, api);
        
        const searchMessage = await api.sendMessage(`🔍 | Searching video | Please wait...`, event.threadID);

        const searchResults = await yts(query);
        if (!searchResults.videos.length) {
          return api.sendMessage("Apologies, but I couldn't find any relevant videos.", event.threadID, event.messageID);
        }

        const video = searchResults.videos[0];
        const videoUrl = video.url;

        const stream = ytdl(videoUrl, { filter: "audioandvideo" });

        const fileName = `${event.senderID}.mp4`;
        const filePath = __dirname + `/cache/${fileName}`;

        stream.pipe(fs.createWriteStream(filePath));

        stream.on('response', () => {
          console.info('[DOWNLOADER]', 'Commencing download...');
        });

        stream.on('info', (info) => {
          console.info('[DOWNLOADER]', `Downloading video: ${info.videoDetails.title}`);
        });

        stream.on('end', () => {
          console.info('[DOWNLOADER] Download completed.');

          if (fs.statSync(filePath).size > 26214400) {
            fs.unlinkSync(filePath);
            api.unsendMessage(searchMessage.messageID);
            
            return api.sendMessage('Apologies, the file exceeds 25MB and cannot be sent.', event.threadID);
          }

          const message = {
            body: `Here is your requested video. Enjoy!🎥\n\nTitle: ${video.title}\nDuration: ${video.duration.timestamp}`,
            attachment: fs.createReadStream(filePath)
          };
          api.unsendMessage(searchMessage.messageID); 

          api.setMessageReaction("", event.messageID, event.messageID, api);

          api.sendMessage(message, event.threadID, () => {
            fs.unlinkSync(filePath);
          });
        });
      } else {
        return api.sendMessage("Apologies, but I couldn't understand the command. Please use -s or -v.", event.threadID);
      }
    } catch (error) {
      console.error('[ERROR]', error);
      api.sendMessage('Apologies, but an error occurred while processing the command.', event.threadID);
    }
  }
};
