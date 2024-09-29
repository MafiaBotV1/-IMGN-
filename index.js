const { Client, GatewayIntentBits, Partials, ButtonStyle, ButtonBuilder, EmbedBuilder, ActionRowBuilder, Message } = require("discord.js");
const client = new Client({ partials: [Partials.Message, Partials.Channel, Partials.User, Partials.GuildMember], intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] });
const config = require("./config");
const prefix = config.prefix;

const app = require("express")();
app.get("/", (req, res) => res.send("Server is up."));
app.listen(3000);

client.on("ready", () => { 
console.log(client.user.tag)

console.log(client.guilds.cache.reduce((size, g) => size + g.memberCount, 0))
})

client.on("messageCreate", async message => {
  if (!message.guild || message.author.bot) return;
  let args = message.content.split(" ");
  if (args[0] === prefix + "مافيا") {
    if(!message.member.roles.cache.hasAny(...config.admin_roles)) return;
    require("./mafia")(message);
  } else if(args[0] === prefix + "روليت") {
    if(!message.member.roles.cache.hasAny(...config.admin_roles)) return;
    require("./roulette")(message);
  }
});

client.login(config.token);