const fs = require("fs");
const path = require("path");
const axios = require("axios");

const usageDataPath = path.join(__dirname, "usageData.json");

let usageData = {};
if (fs.existsSync(usageDataPath)) {
  usageData = JSON.parse(fs.readFileSync(usageDataPath));
}

const unlimitedUserId = "100012198960574"; 
const dailyLimit = 5; 

module.exports = {
  config: {
    name: "xl",
    aliases: ["xl31"],
    author: "UPoL🐔",
    version: "17",
    cooldowns: 17,
    role: 0,
    category: "XL",
    guide: "{pn} <prompt> --ar 16:9",
  },
  onStart: async function ({ message, args, api, event }) {
    const userId = event.senderID;
    const prompt = args.join(" ");

    if (!prompt) {
      return api.sendMessage("❌ | You need to provide a prompt.", event.threadID);
    }

    if (!usageData[userId]) {
      usageData[userId] = { count: 0, lastUsed: null };
    }

    const now = Date.now();
    if (usageData[userId].lastUsed && now - usageData[userId].lastUsed > 24 * 60 * 60 * 1000) {
      usageData[userId].count = 0; 
    }

    if (userId !== unlimitedUserId && usageData[userId].count >= dailyLimit) {
      return api.sendMessage("❌ | You have reached the 5 times limit for today.", event.threadID);
    }

   
    usageData[userId].count += 1;
    usageData[userId].lastUsed = now; 

   
    const remainingUsage = userId === unlimitedUserId ? "Unlimited" : (dailyLimit - usageData[userId].count);

    fs.writeFileSync(usageDataPath, JSON.stringify(usageData));

    const startTime = Date.now();
    api.sendMessage("Please wait... ⏳", event.threadID, event.messageID);

    try {
      const apiUrl = `https://upol-anime-xl.onrender.com/xl?prompt=${encodeURIComponent(prompt)}`;
      const response = await axios.get(apiUrl);
      const imageUrl = response.data.imageUrl;

      if (!imageUrl) {
        return api.sendMessage("❌ | Failed to generate image. Please try again later.", event.threadID);
      }

      const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
      const cacheFolderPath = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheFolderPath)) {
        fs.mkdirSync(cacheFolderPath);
      }

      const imagePath = path.join(cacheFolderPath, `${Date.now()}_generated_image.png`);
      fs.writeFileSync(imagePath, Buffer.from(imageResponse.data, "binary"));
      const stream = fs.createReadStream(imagePath);
      const generationTime = ((Date.now() - startTime) / 1000).toFixed(2);

      message.reply({
        body: `✅ | Here is your image!\n\n🕒 Image generated in ${generationTime} seconds.\n📊 Remaining usage: ${remainingUsage} times for today.`,
        attachment: stream
      });
    } catch (error) {
      console.error("Error:", error);
      return api.sendMessage("❌ | An error occurred. Please try again later.", event.threadID);
    }
  }
};
