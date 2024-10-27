const axios = require('axios');
const fs = require('fs');
const path = require('path');
module.exports = {
  config: {
    name: 'voice',
    version: '1.0',
    author: 'UPoL',
    role: 0,
    category: 'voice ai',
    guide: {
      en: '{pn} <question>\n response with voice ai'
    }
  },
  onStart: async function ({ api, event, message, args, usersData }) {
    const input = args.join(' ');
    if (!input) return message.reply('Please enter a question');
    const userName = await usersData.getName(event.senderID);
    await message.reply('Processing your request....⏳');
    try {
      const hercaiResponse = await axios.get(`https://upolsaha-meaw-meaw.onrender.com/hercai?prompt=${encodeURIComponent(input)}`);
      const textResponse = hercaiResponse.data.answer;
      let extendedResponse = textResponse;
      const targetDuration = 60000; 
      const averageWordsPerMinute = 150;
      const wordsInResponse = textResponse.split(' ').length;
      while ((extendedResponse.split(' ').length / averageWordsPerMinute) * 60000 < targetDuration) {
        extendedResponse += ` ${textResponse}`;
      }
      const languageCode = 'en'; 
      const googleVoiceUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${languageCode}&client=tw-ob&q=${encodeURIComponent(extendedResponse)}`;
      const response = await axios({
        url: googleVoiceUrl,
        method: 'GET',
        responseType: 'stream',
      });
      const filePath = path.resolve(__dirname, 'voice.mp3');
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);
      writer.on('finish', async () => {
        await api.sendMessage({ body: `${textResponse}`, attachment: fs.createReadStream(filePath) }, event.threadID);
        fs.unlinkSync(filePath);
      });
      writer.on('error', (err) => {
        throw new Error('Error generating voice: ' + err.message);
      });
    } catch (error) {
      message.reply(`Error: ${error.message}`);
    }
  }
};
