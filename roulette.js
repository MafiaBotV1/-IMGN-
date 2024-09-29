const { ButtonStyle, ButtonBuilder, EmbedBuilder, ActionRowBuilder } = require("discord.js");
const config = require("./config");
const has_play = new Map();
config.numbers = config.numbers.slice(1);
const canvas = require("canvas");
canvas.registerFont("abdullah.ttf", { family: "Arial" });

async function roulette_command(message) {
  if (has_play.get(message.guild.id)) return message.reply({ content: `❌ هناك بالفعل لعبة فعالة في هذا السيرفر!` });
  let time = 60000;
  let data = {
    author: message.author.id,
    players: [],
    start_in: Date.now() + time,
    type: "roulette"
  }
  let embed = new EmbedBuilder()
    .setColor("Green")
    .setTitle("روليت")
    .setDescription(`
__طريقة اللاعب:__
**1-** اختر الرقم الذي سيمثلك في اللعبة
 **2-** ستبدأ الجولة الأولى وسيتم تدوير العجلة واختيار لاعب عشوائي
**3-** إذا كنت اللاعب المختار ، فستختار لاعبًا من اختيارك ليتم طرده من اللعبة
**4-** يُطرد اللاعب وتبدأ جولة جديدة ، عندما يُطرد جميع اللاعبين ويتبقى لاعبان فقط ، ستدور العجلة ويكون اللاعب المختار هو الفائز باللعبة

__ستبدأ اللعبة خلال__: **<t:${Math.floor(data.start_in / 1000)}:R>**
__ارقام اللاعبين:__
${data.players.map((p, i) => `${i+=1}- <@${p.id}>`).join("\n")}
`)
    .setTimestamp(Date.now() + time);
  let row = new ActionRowBuilder()
    .addComponents(createButton("SUCCESS", `join_roulette`, `دخول إلى اللعبة`), createButton(`DANGER`, `left_roulette`, `اخرج من اللعبة`));
  let row_2 = new ActionRowBuilder()
    .addComponents(createButton("SUCCESS", `join_roulette`, `دخول إلى اللعبة`, null, true), createButton(`DANGER`, `left_roulette`, `اخرج من اللعبة`, null, true));
  let msg = await message.channel.send({ embeds: [embed], components: [row] }).catch(() => 0);
  if (!msg) return;
  has_play.set(message.guild.id, data);
  let start_c = msg.createMessageComponentCollector({ time: time });
  start_c.on("collect", async inter => {
    if (!has_play.get(message.guild.id)) return;
    if (inter.customId === "join_roulette") {
      if (data.players.find(u => u.id == inter.user.id)) return inter.reply({ content: `لقد سجلت بالفعل.`, ephemeral: true });
      if (data.players.length >= 20) return inter.reply({ content: `عدد المشاركين مكتمل`, ephemeral: true });
      data.players.push({
        id: inter.user.id,
        username: inter.user.username,
        avatar: inter.user.displayAvatarURL({ dynamic: true, format: "png" }).split(".").slice(0, inter.user.displayAvatarURL({ dynamic: true, format: "png" }).split(".").length - 1).join(".") + ".png?size=1024"
      });
      has_play.set(message.guild.id, data);
      embed.setDescription(`
__طريقة اللاعب:__
**1-** اختر الرقم الذي سيمثلك في اللعبة
 **2-** ستبدأ الجولة الأولى وسيتم تدوير العجلة واختيار لاعب عشوائي
**3-** إذا كنت اللاعب المختار ، فستختار لاعبًا من اختيارك ليتم طرده من اللعبة
**4-** يُطرد اللاعب وتبدأ جولة جديدة ، عندما يُطرد جميع اللاعبين ويتبقى لاعبان فقط ، ستدور العجلة ويكون اللاعب المختار هو الفائز باللعبة

__ستبدأ اللعبة خلال__: **<t:${Math.floor(data.start_in / 1000)}:R>**
__ارقام اللاعبين:__
${data.players.map((p, i) => `${i+=1}- <@${p.id}>`).join("\n")}
`);
      msg.edit({ embeds: [embed] }).catch(() => 0);
      inter.reply({ content: `✅ تم إضافتك للعبة بنجاح`, ephemeral: true });
    } else if (inter.customId == "left_roulette") {
      let index = data.players.findIndex(i => i.id == inter.user.id);
      if (index == -1) return inter.reply({ content: `❌ - انت غير مشارك بالفعل`, ephemeral: true });
      data.players.splice(index, 1);
      has_play.set(message.guild.id, data);
      embed.setDescription(`
__طريقة اللاعب:__
**1-** اختر الرقم الذي سيمثلك في اللعبة
 **2-** ستبدأ الجولة الأولى وسيتم تدوير العجلة واختيار لاعب عشوائي
**3-** إذا كنت اللاعب المختار ، فستختار لاعبًا من اختيارك ليتم طرده من اللعبة
**4-** يُطرد اللاعب وتبدأ جولة جديدة ، عندما يُطرد جميع اللاعبين ويتبقى لاعبان فقط ، ستدور العجلة ويكون اللاعب المختار هو الفائز باللعبة

__ستبدأ اللعبة خلال__: **<t:${Math.floor(data.start_in / 1000)}:R>**
__ارقام اللاعبين:__
${data.players.map((p, i) => `${i+=1}- <@${p.id}>`).join("\n")}
`);
      msg.edit({ embeds: [embed] }).catch(() => 0);
      inter.reply({ content: `✅ تم إزالتك من اللعبة`, ephemeral: true });
    }
  });
  start_c.on("end", async (end, reason) => {
    if (!has_play.get(message.guild.id)) return;
    embed.setDescription(`
__طريقة اللاعب:__
**1-** اختر الرقم الذي سيمثلك في اللعبة
 **2-** ستبدأ الجولة الأولى وسيتم تدوير العجلة واختيار لاعب عشوائي
**3-** إذا كنت اللاعب المختار ، فستختار لاعبًا من اختيارك ليتم طرده من اللعبة
**4-** يُطرد اللاعب وتبدأ جولة جديدة ، عندما يُطرد جميع اللاعبين ويتبقى لاعبان فقط ، ستدور العجلة ويكون اللاعب المختار هو الفائز باللعبة

__ارقام اللاعبين:__
${data.players.map((p, i) => `${i+=1}- <@${p.id}>`).join("\n")}
`)
      .setColor("Red");
    msg.edit({ embeds: [embed], components: [row_2] }).catch(() => 0);
    if (data.players.length < 1) {
      has_play.delete(message.guild.id);
      return message.channel.send({ content: `🚫 - تم إلغاء اللعبة لعدم وجود 4 لاعبين على الأقل` });
    }
    let clr_num = 0;
    let plys = [];
    let i = 0;
    for(let player of data.players) {
      i += 1;
      clr_num = clr_num >= config.roulette_colors.length ? 1 : clr_num += 1;
      plys.push({ ...player, position: i - 1, color: config.roulette_colors[clr_num-1] });
    }
    data.players = plys;
    has_play.set(message.guild.id, data);
    message.channel.send({ content: `✅ تم توزيع الأرقام على اللاعبين. ستبدأ الجولة الأولى في بضع ثواني...` });
    await sleep(1000);
    await roulette(message);
  });
}

async function rouletteImage(array) {
  let size = 800;
  let avatar_size = 200;
  let Canvas = canvas.createCanvas(size + 50, size + 50);
  let ctx = Canvas.getContext("2d");
  ctx.font = "bold 30px Arial";
  let radian = Math.PI * 2 / array.length;
  let start_angle = (Math.random() * (radian * 360));
  if(start_angle <= 10 || start_angle >= (radian * 360 + 10)) start_angle = radian / 2 * 360;
  start_angle = start_angle / 360;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 5;
  for(let i = 0; i < array.length; i++) {
    let player = array[i];
    let text = `${player.position+1}- ${player.username}`;
    text = text.length > 13 ? text.substring(0, 12) + "..." : text.substring(0, 13);
    ctx.fillStyle = player.color || "#000000";
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, start_angle + (i+1) * radian, start_angle + i * radian, true);
    ctx.arc(size / 2, size / 2, avatar_size / 2, start_angle + i * radian, start_angle + (i+1) * radian, false);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
    ctx.save();
    ctx.translate(size / 2 + Math.cos(start_angle + i * radian + radian / 2) * (size/2), size / 2 + Math.sin(start_angle + i * radian + radian / 2) * (size/2));
    ctx.rotate(start_angle + i * radian + radian / 2);
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(`${text}`, -150, 0);
    ctx.restore();
  }
  ctx.fillStyle = "#cdcdcd";
  ctx.beginPath();
  ctx.moveTo(775, 400);
  ctx.lineTo(835, 430);
  ctx.lineTo(835, 370);
  ctx.fill();
  ctx.closePath();
  let player = array[array.length-1];
  let avatar = await canvas.loadImage(player.avatar);
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, avatar_size / 2, 0, Math.PI * 2, true);
  ctx.stroke();
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, size / 2 - avatar_size / 2, size / 2 - avatar_size / 2, avatar_size, avatar_size);
  return Canvas.toBuffer();
}

async function roulette(message) {
  if (!message || !message.guild) return;
  let data = has_play.get(message.guild.id);
  if (!data) return;
  let winner_index = Math.floor(Math.random() * data.players.length);
  let winner = data.players[winner_index];
  data.players.splice(winner_index, 1);
  data.players = data.players.sort((a, b) => a.position - b.position);
  data.players.push(winner);
  has_play.set(message.guild.id, data);
  let image = await rouletteImage(data.players);
  if(data.players.length <= 2) {
    await message.channel.send({ content: `${winner.position+1} - <@${winner.id}>\n**👑 هذه الجولة الأخيرة ! اللاعب المختار هو اللاعب الفائز في اللعبة.**`, files: [{ name: "roulette.png", attachment: image }] });
    await sleep(1000);
    message.channel.send({ content: `👑 - فاز <@${winner.id}> في اللعبة` });
    has_play.delete(message.guild.id);
  } else {
    await message.channel.send({ content: `${winner.position+1} - <@${winner.id}>`, files: [{ name: "roulette.png", attachment: image }] });
    let buttons_array = data.players.filter(a => a.id != winner.id).map(p => ({ id: p.id, label: p.username, disabled: false, emoji: config.numbers[p.position] }));
    buttons_array.push({
      id: winner.id,
      label: "انسحاب",
      disabled: false
    });
    let msg = await message.channel.send({ content: `<@${winner.id}> لديك **30 ثانية** لإختيار لاعب لطرده`, components: createMultipleButtons(buttons_array, winner) });
    let collect = await msg.awaitMessageComponent({ filter: m => m.user.id == winner.id, time: 30000 }).catch(() => 0);
    if(!has_play.get(message.guild.id)) return;
    buttons_array = buttons_array.map(e => ({...e, disabled: true }));
    await msg.edit({ components: createMultipleButtons(buttons_array, winner) }).catch(() => 0);
    let choice;
    if(!collect || !collect.customId) {
      choice = winner.id;
      message.channel.send({ content: `💣 | تم طرد <@${winner.id}> من اللعبة لعدم تفاعله ، سيتم بدء الجولة القادمة في بضع ثواني...` });
    } else if(collect.customId == winner.id) {
      collect.deferUpdate();
      choice = winner.id;
      message.channel.send({ content: `💣 | لقد انسحب <@${winner.id}> من اللعبة ، سيتم بدء الجولة القادمة في بضع ثواني...` });
    } else {
      collect.deferUpdate();
      choice = collect.customId;
      message.channel.send({ content: `💣 | تم طرد <@${choice}> من اللعبة ، سيتم بدء الجولة القادمة في بضع ثواني...` });
    }
    if(!choice) return;
    let index = data.players.findIndex(p => p.id == choice);
    if(index == -1) return;
    data.players.splice(index, 1);
    has_play.set(message.guild.id, data);
    await sleep(1000);
    roulette(message);
  }
}

function createMultipleButtons(array, winner) {
  let components = [];
  let c = 5;
  for (let i = 0; i < array.length; i += c) {
    let buttons = array.slice(i, i + c);
    let component = new ActionRowBuilder()
    for (let button of buttons) {
      let btn = new ButtonBuilder()
        .setStyle(winner.id != button.id ? ButtonStyle.Secondary : ButtonStyle.Danger)
        .setLabel(button.label)
        .setCustomId(`${button.id}`)
        .setDisabled(button.disabled ? button.disabled : false);
      if (button.emoji) {
        btn.setEmoji(button.emoji);
      }
      component.addComponents(btn);
    }
    components.push(component);
  }
  return components;
}

function createButton(style, customId, label, emoji, disabled) {
  let styles = {
    PRIMARY: ButtonStyle.Primary,
    SECONDARY: ButtonStyle.Secondary,
    SUCCESS: ButtonStyle.Success,
    DANGER: ButtonStyle.Danger
  }
  let btn = new ButtonBuilder()
    .setStyle(styles[style])
    .setCustomId(customId)
    .setLabel(label)
    .setDisabled(disabled ? disabled : false);
  if (emoji) btn.setEmoji(emoji);
  return btn;
}

function sleep(time) {
  return new Promise((resolve) => setTimeout(() => resolve(time), time));
}

module.exports = roulette_command;