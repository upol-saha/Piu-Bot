const axios = require("axios");
const fs = require("fs");

module.exports = {
  config: {
    name: "hercai",
    aliases: ["herc"],
    version: "1.0",
    author: "UPoL Apis 🐔",
    role: 0,
    category: "ai"
  },
  onStart: async function({ message, event, args, commandName }) {

			const path = require("path");
    const text = args.join(' ');

    await message.reply("Please wait.....");

    try {
      if (text.toLowerCase().includes('image') || text.toLowerCase().includes('imagine')) {
        
        const response = await axios.get(`https://upol-ai-docs.onrender.com/imagine?prompt=${encodeURIComponent(text)}&apikey=UPoLxyzFM-69vsg`);
        
            const imagineResponse = await axios.get(response, {
        responseType: "arraybuffer"
      });

      const cacheFolderPath = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheFolderPath)) {
        fs.mkdirSync(cacheFolderPath);
      }
      const imagePath = path.join(cacheFolderPath, `${Date.now()}_generated_image.png`);
      fs.writeFileSync(imagePath, Buffer.from(imagineResponse.data, "binary"));

      const stream = fs.createReadStream(imagePath);
          message.reply({
            body: "",
            attachment: stream
          });
      } else {
        const response = await axios.get(`https://upolsaha-meaw-meaw.onrender.com/hercai?prompt=${encodeURIComponent(text)}`);

        if (response.data && response.data.answer) {
          const answer = response.data.answer;
          message.reply({
            body: answer,
          }, (err, info) => {
            global.GoatBot.onReply.set(info.messageID, {
              commandName,
              messageID: info.messageID,
              author: event.senderID
            });
          });
        }
      }

    } catch (error) {
      console.error("Error:", error.message);
    }
  },

  onReply: async function({ message, event, Reply, args }) {
    let { author, commandName } = Reply;
    if (event.senderID != author) return;

    const gif = args.join(' ');
    const url = args[1] || '';
    const prompt = args[2] || '';

    try {
  
      if (gif.toLowerCase().includes('image') || gif.toLowerCase().includes('imagine')) {
     
        const response = await axios.get(`https://upol-ai-docs.onrender.com/imagine?prompt=${encodeURIComponent(prompt)}&apikey=UPoLxyzFM-69vsg`);
        
            const imagineResponse = await axios.get(response, {
        responseType: "arraybuffer"
      });

      const cacheFolderPath = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheFolderPath)) {
        fs.mkdirSync(cacheFolderPath);
      }
      const imagePath = path.join(cacheFolderPath, `${Date.now()}_generated_image.png`);
      fs.writeFileSync(imagePath, Buffer.from(imagineResponse.data, "binary"));

      const stream = fs.createReadStream(imagePath);
          message.reply({
            body: "",
            attachment: stream
          });
      } else {
     
        const response = await axios.get(`https://upolsaha-meaw-meaw.onrender.com/hercai?prompt=${encodeURIComponent(gif)}`);

        if (response.data && response.data.answer) {
          const answer = response.data.answer;
          message.reply({
            body: answer,
          }, (err, info) => {
            global.GoatBot.onReply.set(info.messageID, {
              commandName,
              messageID: info.messageID,
              author: event.senderID
            });
          });
        }
      }

    } catch (error) {
      console.error("Error:", error.message);
    }
  }
};
