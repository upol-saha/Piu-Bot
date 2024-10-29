const axios = require('axios');
module.exports = { 
   config: { 
   name: 'gemini', 
   version: '1.0', 
   author: 'UPoL 🐔', 
   role: 0, 
   shortDescription: {
      en: '' 
    }, 
   longDescription: { 
      en: '' 
    }, 
   category: 'Gemini', 
   guide: { 
      en: "{pn} <question>"
   } 
 }, 
 onStart: async function ({ api, event, message, args, usersData }) {
      const input = args.join(' '); 
      if (!input) {
          return message.reply('Enter a question'); 
          }
     const wait = await message.reply('Please wait....⏳');
     try { 
       const res = await axios.get(`https://upol-piu.onrender.com/gemini?prompt=${encodeURIComponent(input)}`); 
       const answer = res.data.answer; 
       const msg = `${answer}`;
       message.reply(msg);
			message.unsend(wait);
    } catch (error) { 
      message.reply(`Error: ${error.message}`); 
    }
  }
};
