require('dotenv').config();

const path = require('path');
const ffmpegPath = require('ffmpeg-static');

process.env.FFMPEG_PATH = ffmpegPath;
process.env.PATH = `${path.dirname(ffmpegPath)}${path.delimiter}${process.env.PATH}`;

console.log('FFmpeg path:', ffmpegPath);

const { Client, GatewayIntentBits } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  StreamType
} = require('@discordjs/voice');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates]
});

client.on('voiceStateUpdate', (oldState, newState) => {
  console.log(
    '[DISCORD VOICE STATE]',
    newState.member?.user?.tag,
    oldState.channelId,
    '->',
    newState.channelId
  );
});

const cheeses = ['cheese', 'cheddar', 'mozzarella', 'gouda', 'parmesan', 'feta', 'swiss', 'brie', 'camembert', 'ricotta', 'provolone', 'gruyere', 'havarti', 'colby',
   'monterey jack', 'pepper jack', 'asiago', 'fontina', 'manchego', 'gorgonzola'];
const cheeseCount = {};

client.on('messageCreate', async message => {
  if (message.author.bot) return; // ignore bots

const text = message.content.toLowerCase();

  const mentionsBot = message.mentions.has(client.user);
  const isQuestion = text.includes('?');

  // Cheeses and Bread
  const hasCheese = cheeses.some(cheese => text.includes(cheese));
  const hasBread = text.includes('bread');

if (text.startsWith('!')) {
  // handle commands here (or just ignore for cheese logic)
  // IMPORTANT: stop cheese detection from running
  console.log('Command received:', text);

  if (text === '!cheesetop') {
  db.all(`
    SELECT userId, count
    FROM cheese
    ORDER BY count DESC
    LIMIT 5
  `, (err, rows) => {
    if (err) return console.log(err);

    if (!rows.length) {
      return message.reply('No cheese data yet 🧀');
    }

    let output = '🧀 Cheese Leaderboard 🧀\n';

    rows.forEach((row, i) => {
      output += `${i + 1}. <@${row.userId}> - ${row.count}\n`;
    });

    message.reply(output);
  });
  return;
}

if (text === '!cheesecount') {
  const id = message.author.id;

  db.get(
    `SELECT count FROM cheese WHERE userId = ?`,
    [id],
    (err, row) => {
      if (err) {
        console.log(err);
        return;
      }

      const count = row ? row.count : 0;

      message.reply(`<@${id}> you have mentioned cheese ${count} times 🧀`);
    }
  );

  return;
}

if (text === '!sound') {
  console.log('!sound command started');

  const voiceChannel = message.member?.voice?.channel;

  if (!voiceChannel) {
    return message.reply('You need to be in a voice channel first');
  }

  console.log('Voice channel:', voiceChannel.name);

console.log(
  '[BEFORE JOIN] Bot voice state:',
  message.guild.voiceStates.cache.get(client.user.id)
);

  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: voiceChannel.guild.id,
    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    selfDeaf: true,
    selfMute: false,
    debug: false
  });

  console.log('Voice connection created');

  connection.on('debug', debug => {
    console.log('[VOICE DEBUG]', debug);
  });

  connection.on('error', error => {
    console.error('[VOICE CONNECTION ERROR]', error);
  });

  connection.on('stateChange', (oldState, newState) => {
    console.log(
      `Connection state: ${oldState.status} -> ${newState.status}`
    );
  });

  const player = createAudioPlayer();

  player.on(AudioPlayerStatus.Playing, () => {
    console.log('Audio player is playing!');
  });

  player.on(AudioPlayerStatus.Idle, () => {
    console.log('Sound finished!');
    connection.destroy();
  });

  player.on('error', error => {
    console.error('Audio player error:', error);
    connection.destroy();
  });

  connection.subscribe(player);

  setTimeout(() => {
    const botVoiceState =
      message.guild.voiceStates.cache.get(client.user.id);

    console.log('[VOICE CACHE CHECK]');
    console.log('Bot channel:', botVoiceState?.channelId);
    console.log('Bot session ID:', botVoiceState?.sessionId);
  }, 3000);

  connection.on(VoiceConnectionStatus.Ready, () => {
    console.log('Voice connection is ready!');

    const resource = createAudioResource('./cheese.mp3');

    console.log('Audio resource created');

    player.play(resource);

    console.log('Started playing cheese.mp3');
  });

  return;
}

} else {
  // normal message logic goes here
  if (hasCheese) {
    const id = message.author.id;

    db.run(`
      INSERT INTO cheese (userId, count)
      VALUES (?, 1)
      ON CONFLICT(userId)
      DO UPDATE SET count = count + 1
    `, [id]);
  }

  if (hasBread && !mentionsBot) {
    message.reply("That's not cheese");
    return;
  }

  if (hasCheese && !mentionsBot) {
    message.reply('Cheese');
  }

  // yes/no stuff
  if (mentionsBot && isQuestion) {
    const responses = ['Yes', 'No', 'Maybe', 'Nuh uh', 'What is the meaning of life? :('];
    const reply = responses[Math.floor(Math.random() * responses.length)];

    message.reply(reply);
  }

  // Goodnight and good morning
  if (message.content.toLowerCase().includes('goodnight') && mentionsBot && !isQuestion) {
    message.reply({
      content: `Goodnight <@${message.author.id}>`
    })
  }

  if (message.content.toLowerCase().includes('good morning') && mentionsBot && !isQuestion) {
    message.reply({
      content: `Good morning <@${message.author.id}>`
    })
  }

  // Winton
  if (message.content.toLowerCase().includes('winton') && !isQuestion) {
  message.reply({files: ['./Winton.webp']});
  }
  if (message.content.toLowerCase().includes('greetings') && !isQuestion) {
  message.reply({files: ['./Winton.webp']});
  }
}});

client.on('voiceStateUpdate', (oldState, newState) => {
  if (newState.id === client.user.id) {
    console.log(
      'Bot voice state:',
      oldState.channelId,
      '->',
      newState.channelId
    );
  }
});

client.on('raw', packet => {
  if (
    packet.t === 'VOICE_STATE_UPDATE' ||
    packet.t === 'VOICE_SERVER_UPDATE'
  ) {
    console.log(`[RAW VOICE] ${packet.t}`);

    if (packet.t === 'VOICE_STATE_UPDATE') {
      console.log('  User ID:', packet.d.user_id);
      console.log('  Guild ID:', packet.d.guild_id);
      console.log('  Channel ID:', packet.d.channel_id);
      console.log('  Session ID:', packet.d.session_id);
    }

    if (packet.t === 'VOICE_SERVER_UPDATE') {
      console.log('  Guild ID:', packet.d.guild_id);
      console.log('  Endpoint:', packet.d.endpoint);
    }
  }
});

client.on('voiceStateUpdate', (oldState, newState) => {
  console.log(
    '[DISCORD VOICE STATE]',
    newState.member?.user?.tag,
    oldState.channelId,
    '->',
    newState.channelId
  );
});

client.once('ready', () => {
  console.log('Bot is online!');
});

client.login(process.env.DISCORD_TOKEN);