const axios = require('axios');
const fs = require('fs');
const path = require('path');
module.exports = { 
  config: { 
    name: 'vai', 
    aliases: ['voiceai'], 
    version: '1.1', 
    author: 'UPoL', 
    role: 0, 
    shortDescription: {
      en: 'Ask a question to GPT and get a voice response using Google TTS' 
    }, 
    longDescription: { 
      en: 'Ask a question to GPT and receive the response in audio format using Google Translate TTS.' 
    }, 
    category: 'CHAT-GPT', 
    guide: { 
      en: "{pn} <question>" 
    } 
  }, 
  onStart: async function ({ api, event, message, args, usersData }) {
    const input = args.join(' '); 
    if (!input) {
      return message.reply('Enter a question'); 
    }
    await message.reply('Please wait....⏳');
    try { 
      const res = await axios.get(`https://upol-dev-gpt-api.onrender.com/api/gpt?prompt=${encodeURIComponent(input)}&model=gpt-4`);
      const answer = res.data.answer; 
      const msg = `${answer}`;
      const languageCode = 'en'; 
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${languageCode}&client=tw-ob&q=${encodeURIComponent(answer)}`;
      const response = await axios.get(ttsUrl, { responseType: 'arraybuffer' });
      const audioFilePath = path.join(__dirname, `response_${event.senderID}.mp3`);
      fs.writeFileSync(audioFilePath, response.data);
      api.sendMessage({ 
        body: msg, 
        attachment: fs.createReadStream(audioFilePath) 
      }, event.threadID, () => {
        fs.unlinkSync(audioFilePath);
      });
    } catch (error) { 
      message.reply(`Error: ${error.message}`); 
    }
  }
};
