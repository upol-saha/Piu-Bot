const i = require("fs");
const m = require("path");
const a = require("axios");
module.exports = {
  config: {
    name: "mj",
    author: "UPoL",
    version: "1.0",
    cooldowns: 400,
    role: 0,
    guide: {
      en: "{pn} <prompt>"
    }
  },
  onStart: async function ({ message, args, api, event }) {
    const o = args.join(" ");
    if (!o) {
      return api.sendMessage("add prompt.", event.threadID);
    }
    await message.reply("Processing....⏳", event.threadID, event.messageID);
    try {
      const u = `https://upol-happyjourney.onrender.com/midjourney?prompt=${encodeURIComponent(o)}`;
      const r = await a.get(u, {
        responseType: "arraybuffer"
      });
      const cp = m.join(__dirname, "cache");
      if (!i.existsSync(cp)) {
        i.mkdirSync(cp);
      }
      const p = m.join(cp, `${Date.now()}_generated_image.png`);
      i.writeFileSync(p, Buffer.from(r.data, "binary"));
      const s = i.createReadStream(p);
      message.reply({
        body: "Generated!",
        attachment: s
      }, event.threadID, () => {
        i.unlinkSync(p);
      });
    } catch (error) {
      console.error("Error:", error);
      api.sendMessage("error.", event.threadID, event.messageID);
    }
  }
};
