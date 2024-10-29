const yts = require('yt-search');
const ytdl = require('@distube/ytdl-core');

module.exports = {
	config: {
		name: "yt",
		version: "1.0",
		author: "UPoL",
		countDown: 5,
		role: 0,
		shortDescription: {
			en: "Search and download YouTube audio or video"
		},
		description: {
			en: "Search YouTube and download audio or video using the -a (audio) or -v (video) option"
		},
		category: "media",
		guide: {
			en: "{pn} -a <search query> to download audio\n{pn} -v <search query> to download video"
		}
	},

	onStart: async function ({ api, args, message, event }) {
		if (args.length < 2) return message.reply("Please specify an option (-a or -v) and a search query.");
    
		const option = args[0];
		const searchQuery = args.slice(1).join(' ');

		if (option !== '-a' && option !== '-v') {
			return message.reply("Invalid option. Use -a for audio or -v for video.");
		}

		try {
			const searchResults = await yts(searchQuery);
			const video = searchResults.videos[0]; 

			if (!video) return message.reply("No video found for the given search query.");

			const videoUrl = video.url;

			await message.reply(`Found: ${video.title}\nDuration: ${video.timestamp}\nDownloading now...`);

			const streamOptions = option === '-a' ? { filter: 'audioonly' } : { quality: 'highestvideo' };
      
			const stream = ytdl(videoUrl, streamOptions);
      
			const attachmentType = option === '-a' ? 'audio' : 'video';
			const fileExtension = option === '-a' ? 'mp3' : 'mp4';

			return message.reply({
				body: `Here's your requested ${attachmentType} for "${video.title}"`,
				attachment: stream.pipe(api.createAttachmentStream(fileExtension))
			});

		} catch (error) {
			console.error(error);
			return message.reply("An error occurred while processing your request.");
		}
	}
};
