require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');

const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./cheese.db');

  db.run(`
    CREATE TABLE IF NOT EXISTS cheese (
      userId TEXT PRIMARY KEY,
      count INTEGER
    )
  `);

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const cheeses = ['cheese', 'cheddar', 'mozzarella', 'gouda', 'parmesan', 'feta', 'swiss'];
const cheeseCount = {};

client.on('messageCreate', message => {
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

client.once('ready', () => {
  console.log('Bot is online!');
});

client.login(process.env.DISCORD_TOKEN);