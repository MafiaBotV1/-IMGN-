const { ButtonStyle, ButtonBuilder, EmbedBuilder, ActionRowBuilder } = require("discord.js");
const config = require("./config");
const has_play = new Map();

async function mafia_command(message) {
  if (has_play.get(message.guild.id)) return message.reply({ content: `❌ هناك بالفعل لعبة فعالة في هذا السيرفر!` });
  let time = 60000;
  let data = {
    author: message.author.id,
    players: [],
    start_in: Date.now() + time,
    type: "mafia"
  }
  let embed = new EmbedBuilder()
    .setColor("Green")
    .setTitle("مافيا")
    .setDescription(`
__طريقة اللاعب:__
**1-** شارك في اللعبة بالضغط على الزر أدناه
**2-** سيتم توزيع اللاعبين على مافيا ، مواطنين وأيضا طبيب واحد بشكل عشوائي
**3-** في كل جولة ، ستصوت المافيا لطرد شخص واحد من اللعبة. ثم سيصوت الطبيب لحماية شخص واحد من المافيا. وفي النهاية الجولة ، سيحاول جميع اللاعبين التصويت وطرد إحدى أعضاء المافيا
**4-** إذا تم طرد جميع المافيا ، سيفوز المواطنين ، وإذا كانت المافيا تساوي عدد المواطنين ، فستفوز المافيا.
__ستبدأ اللعبة خلال__: **<t:${Math.floor(data.start_in / 1000)}:R>**
__اللاعبين المشاركين:__ **(${data.players.length}/20)**
${data.players.map(p => `- <@${p.id}>`).join("\n")}
`)
    .setTimestamp(Date.now() + time);
  let row = new ActionRowBuilder()
    .addComponents(createButton("SUCCESS", `join_mafia`, `دخول إلي اللعبة`), createButton(`DANGER`, `left_mafia`, `اخرج من اللعبة`));
  let row_2 = new ActionRowBuilder()
    .addComponents(createButton("SUCCESS", `join_mafia`, `دخول إلي اللعبة`, null, true), createButton(`DANGER`, `left_mafia`, `اخرج من اللعبة`, null, true));
  let msg = await message.channel.send({ embeds: [embed], components: [row] }).catch(() => 0);
  if (!msg) return;
  has_play.set(message.guild.id, data);
  let start_c = msg.createMessageComponentCollector({ time: time });
  start_c.on("collect", async inter => {
    if (!has_play.get(message.guild.id)) return;
    if (inter.customId === "join_mafia") {
      if (data.players.find(u => u.id == inter.user.id)) return inter.reply({ content: `لقد سجلت بالفعل.`, ephemeral: true });
      if (data.players.length >= 20) return inter.reply({ content: `عدد المشاركين مكتمل`, ephemeral: true });
      data.players.push({
        id: inter.user.id,
        username: inter.user.username,
        avatar: inter.user.displayAvatarURL({ dynamic: true, format: "png" }),
        type: "person",
        interaction: inter,
        vote_kill: 0,
        vote_kick: 0
      });
      has_play.set(message.guild.id, data);
      embed.setDescription(`
__طريقة اللعب:__
**1-** شارك في اللعبة بالضغط على الزر أدناه
**2-** سيتم توزيع اللاعبين على مافيا ، مواطنين وأيضا طبيب واحد بشكل عشوائي
**3-** في كل جولة ، ستصوت المافيا لطرد شخص واحد من اللعبة. ثم سيصوت الطبيب لحماية شخص واحد من المافيا. وفي النهاية الجولة ، سيحاول جميع اللاعبين التصويت وطرد إحدى أعضاء المافيا
**4-** إذا تم طرد جميع المافيا ، سيفوز المواطنين ، وإذا كانت المافيا تساوي عدد المواطنين ، فستفوز المافيا.
__ستبدأ اللعبة خلال__: **<t:${Math.floor(data.start_in / 1000)}:R>**
__اللاعبين المشاركين:__ **(${data.players.length}/20)**
${data.players.map(p => `- <@${p.id}>`).join("\n")}
`);
      msg.edit({ embeds: [embed] }).catch(() => 0);
      inter.reply({ content: `✅ تم إضافتك للمشتركين بنجاح`, ephemeral: true });
    } else if (inter.customId == "left_mafia") {
      let index = data.players.findIndex(i => i.id == inter.user.id);
      if (index == -1) return inter.reply({ content: `❌ - انت غير مشارك بالفعل`, ephemeral: true });
      data.players.splice(index, 1);
      has_play.set(message.guild.id, data);
      embed.setDescription(`
__طريقة اللعب:__
**1-** شارك في اللعبة بالضغط على الزر أدناه
**2-** سيتم توزيع اللاعبين على مافيا ، مواطنين وأيضا طبيب واحد بشكل عشوائي
**3-** في كل جولة ، ستصوت المافيا لطرد شخص واحد من اللعبة. ثم سيصوت الطبيب لحماية شخص واحد من المافيا. وفي النهاية الجولة ، سيحاول جميع اللاعبين التصويت وطرد إحدى أعضاء المافيا
**4-** إذا تم طرد جميع المافيا ، سيفوز المواطنين ، وإذا كانت المافيا تساوي عدد المواطنين ، فستفوز المافيا.

__ستبدأ اللعبة خلال__: **<t:${Math.floor(data.start_in / 1000)}:R>**
__اللاعبين المشاركين:__ **(${data.players.length}/20)**
${data.players.map(p => `- <@${p.id}>`).join("\n")}
`);
      msg.edit({ embeds: [embed] }).catch(() => 0);
      inter.reply({ content: `✅ تم إزالتك من المشتركين`, ephemeral: true });
    }
  });
  start_c.on("end", async (end, reason) => {
    if (!has_play.get(message.guild.id)) return;
    embed.setDescription(`
__طريقة اللعب:__
**1-** شارك في اللعبة بالضغط على الزر أدناه
**2-** سيتم توزيع اللاعبين على مافيا ، مواطنين وأيضا طبيب واحد بشكل عشوائي
**3-** في كل جولة ، ستصوت المافيا لطرد شخص واحد من اللعبة. ثم سيصوت الطبيب لحماية شخص واحد من المافيا. وفي النهاية الجولة ، سيحاول جميع اللاعبين التصويت وطرد إحدى أعضاء المافيا
**4-** إذا تم طرد جميع المافيا ، سيفوز المواطنين ، وإذا كانت المافيا تساوي عدد المواطنين ، فستفوز المافيا.

__اللاعبين المشاركين:__ **(${data.players.length}/20)**
${data.players.map(p => `- <@${p.id}>`).join("\n")}
`)
      .setColor("Red");
    msg.edit({ embeds: [embed], components: [row_2] }).catch(() => 0);
    if (data.players.length < 1) {
      has_play.delete(message.guild.id);
      return message.channel.send({ content: `🚫 - تم إلغاء اللعبة لعدم وجود 5 لاعبين على الأقل` });
    }
    let c = 5;
    for (let i = 0; i < data.players.length; i += c) {
      let array = data.players.slice(i, i + c);
      if (i == 0) {
        let mafia_i = Math.floor(Math.random() * array.length);
        let mafia = array[mafia_i];
        array.splice(mafia_i, 1);
        let mafia_index = data.players.findIndex(m => m.id == mafia.id);
        if (mafia_index != -1) {
          data.players[mafia_index].type = "mafia";
        }
        let doctor_i = Math.floor(Math.random() * array.length);
        let doctor = array[doctor_i];
        let doctor_index = data.players.findIndex(m => m.id == doctor.id);
        data.players[doctor_index].type = "doctor";
      } else {
        if (array.length >= 5) {
          let mafia_i = Math.floor(Math.random() * array.length);
          let mafia = array[mafia_i];
          let mafia_index = data.players.findIndex(m => m.id == mafia.id);
          if (mafia_index != -1) {
            data.players[mafia_index].type = "mafia";
          }
        }
      }
    }
    has_play.set(message.guild.id, data);
    for (let player of data.players) {
      if (player.type == "person") {
        await player.interaction.followUp({ content: `👥 | تم اختيارك انت كـ **مواطن**. في كل جولة يجب عليك التحقق مع جميع اللاعبين لأكتشاف المافيا وطردهم من اللعبة`, ephemeral: true }).catch(() => 0);
      } else if (player.type == "doctor") {
        await player.interaction.followUp({ content: `🧑‍⚕️ | تم اختيارك انت كـ **الطبيب**. في كل جولة يمكنك حماية شخص واحد من هجوم المافيا`, ephemeral: true }).catch(() => 0);
      } else if (player.type == "mafia") {
        await player.interaction.followUp({ content: `🕵️ | تم اختيارك انت  كـ **مافيا**. يجب عليكم محاولة اغتيال جميع اللاعبين بدون اكتشافكم`, ephemeral: true }).catch(() => 0);
      }
    }
    message.channel.send({
      content: `
✅ تم توزيع الرتب على اللاعبين. ستبدأ الجولة الأولى في بضع ثواني...

__الفريق الأول (المواطنين):__
**${data.players.filter(p => p.type == "doctor").length}** طبيب
**${data.players.filter(p => p.type == "person").length}** مواطن

__الفريق الثاني (المافيا):__
**${data.players.filter(p => p.type == "mafia").length}** مافيا
`
    });
    await sleep(700);
    await mafia(message);
  });
}

async function mafia(message) {
  if (!message || !message.guild) return;
  let data = has_play.get(message.guild.id);
  if (!data) return;
  let mafia = data.players.filter(t => t.type == "mafia");
  let doctor = data.players.find(t => t.type == "doctor");
  let person = data.players.filter(t => t.type != "mafia");
  let person_buttons = createMultipleButtons(person.map((p) => ({ id: p.id, label: p.username, disabled: false, index: person.findIndex(u => u.id == p.id) })), "kill");
  for (let m of mafia) {
    await m.interaction.followUp({ content: `أمامك 20 ثانية للتصويت على مواطن ليتم قتله`, components: person_buttons, ephemeral: true }).catch(() => 0);
  }
  message.channel.send({ content: `🔪 | جاري انتظار المافيا لاختيار شخص لقتله...` });
  let kill_c = message.channel.createMessageComponentCollector({ filter: m => mafia.find(n => n.id == m.user.id) && m.customId.startsWith("kill"), time: 20000 });
  let collected = [];
  kill_c.on("collect", async inter => {
    if (!has_play.get(message.guild.id)) return;
    if (collected.find(i => i == inter.user.id)) return;
    collected.push(inter.user.id);
    await inter.update({ content: `تم التصويت بنجاح انتظر النتيجة`, components: [] }).catch(() => 0);
    let index = inter.customId.split("_")[2];
    person[index].vote_kill += 1;
    if (collected.length >= mafia.length) return kill_c.stop();
  });
  kill_c.on("end", async (end, reason) => {
    if (!has_play.get(message.guild.id)) return;
    person = person.sort((a, b) => b.vote_kill - a.vote_kill);
    for (let maf of mafia) {
      if (!collected.find(i => i == maf.id)) {
        let index = mafia.findIndex(m => m.id == maf.id);
        if (index != -1) {
          mafia.splice(index, 1);
          if (mafia.length >= 1) {
            let index_1 = data.players.findIndex(m => m.id == maf.id);
            if (index_1 != -1) {
              data.players.splice(index_1, 1);
              has_play.set(message.guild.id, data);
            }
            message.channel.send({ content: `🕐 | تم طرد <@${maf.id}> من المافيا لعدم تفاعله... ستبدأ الجولة التالية في غضون ثوانٍ قليلة` });
            await sleep(1000);
            restart(message);
          } else {
            message.channel.send({ content: `🕐 | تم طرد <@${maf.id}> من المافيا لعدم تفاعله...` });
            win(message, "person");
          }
          return;
        }
      }
    }
    let killed_person = person[0];
    message.channel.send({ content: `🔪 | اختارت المافيا الشخص الذي سيتم اغتياله` });
    await sleep(1000);
    let id = null;
    if (doctor) {
      message.channel.send({ content: `💊 | جاري انتظار الطبيب لاختيار شخص لحمايته...` });
      let all_buttons = createMultipleButtons(data.players.map((p) => ({ id: p.id, label: p.username, disabled: false, index: data.players.findIndex(u => u.id == p.id) })), "protect");
      await doctor.interaction.followUp({ content: `أمامك **20** ثانية لاختيار شخص لحمايته...`, components: all_buttons, ephemeral: true, fetchReply: true }).catch(() => 0);
      let doctor_collect = await message.channel.awaitMessageComponent({ filter: m => m.user.id == doctor.id && m.customId.startsWith("protect"), time: 20000 }).catch(() => 0);
      if (!doctor_collect || !doctor_collect.customId) {
        message.channel.send({ content: `💊 | لم يختر الطبيب أحد ليحميه من الإغتيال` });
      } else {
        message.channel.send({ content: `💊 | اختار الطبيب الشخص الذي سيحميه من اغتيال المافيا` });
      }
      id = doctor_collect ? doctor_collect.customId.split("_")[1] : null;
    }
    if (id == killed_person.id) {
      message.channel.send({ content: `🛡️ | فشلت عملية المافيا لقتل <@${killed_person.id}> لأنه تم حمايته من قبل الطبيب` });
    } else {
      let index_2 = data.players.findIndex(b => b.id == killed_person.id);
      if (index_2 != -1) {
        data.players.splice(index_2, 1);
        has_play.set(message.guild.id, data);
      }
      await message.channel.send({ content: `⚰️ | نجحت عملية المافيا وتم قتل <@${killed_person.id}> وهذا الشخص كان **${killed_person.type == "doctor" ? "طبيب" : "مواطن"}**` });
    }
    if (data.players.filter(b => b.type == "person").length <= data.players.filter(b => b.type == "mafia").length) return win(message, "mafia");
    message.channel.send({ content: `🔍 | لديكم **15 ثانية** للتحقق بين اللاعبين ومعرفة المافيا للتصويت على طرده من اللعبة` });
    await sleep(15000);
    let all = data.players.map(m => m);
    let all_buttons = createMultipleButtons(all.map((p) => ({ id: p.id, label: p.username, disabled: false, emoji: config.numbers[p.vote_kick], index: data.players.findIndex(u => u.id == p.id) })), "kick");
    let msg = await message.channel.send({ content: `لديكم **20 ثانية** لاختيار شخص لطرده من اللعبة`, components: all_buttons });
    let kick_c = msg.createMessageComponentCollector({ filter: n => data.players.find(m => m.id == n.id) && n.customId.startsWith("kick"), time: 20000 });
    let collected_1 = [];
    kick_c.on("collect", async inter => {
      if (!has_play.get(message.guild.id)) return;
      if (collected_1.find(i => i == inter.user.id)) return;
      collected_1.push(inter.user.id);
      let user_id = inter.customId.split("_")[1];
      let index = all.findIndex(i => i.id == user_id);
      if (index != -1) {
        all[index].vote_kick += 1;
        let all_buttons_2 = createMultipleButtons(all.map((p) => ({ id: p.id, label: p.username, disabled: false, emoji: config.numbers[p.vote_kick], index: data.players.findIndex(u => u.id == p.id) })), "kick");
        msg.edit({ components: all_buttons_2 }).catch(() => 0);
      }
      inter.deferUpdate().catch(() => 0);
      if (collected_1.length >= all.length) return kick_c.stop();
    });
    kick_c.on("end", async (end, reason) => {
      if (!has_play.get(message.guild.id)) return;
      let all_buttons_2 = createMultipleButtons(all.map((p) => ({ id: p.id, label: p.username, disabled: true, emoji: config.numbers[p.vote_kick], index: data.players.findIndex(u => u.id == p.id) })), "kick");
      msg.edit({ components: all_buttons_2 }).catch(() => 0);
      let choices = all.sort((a, b) => b.vote_kick - a.vote_kick);
      if (choices[0].vote_kick == choices[1].vote_kick) {
        message.channel.send({ content: `⏭ | بسبب تعادل التصويت ، تم تخطي الطرد ... الجولة القادمة ستبدأ في بضع ثوان` });
        await sleep(1000);
        await restart(message);
      } else {
        let kicked = choices[0];
        let index = data.players.findIndex(i => i.id == kicked.id);
        if (index != -1) {
          data.players.splice(index, 1);
          has_play.set(message.guild.id, data);
        }
        message.channel.send({ content: `💣 | تم التصويت على طرد <@${kicked.id}> وكان هذا الشخص **${kicked.type == "mafia" ? "مافيا" : kicked.type == "doctor" ? "طبيب" : "مواطن"}**` });
        if(data.players.filter(b => b.type == "person").length <= data.players.filter(b => b.type == "mafia").length) return win(message, "mafia");
        if(data.players.filter(b => b.type == "mafia").length <= 0) return win(message, "person");
        message.channel.send({ content: `ستبدأ الجولة التالية بعد بضع ثوان...` });
        await sleep(1000);
        restart(message);
      }
    });
  });
}

function restart(message) {
  mafia(message);
}

async function win(message, who) {
  let data = has_play.get(message.guild.id);
  if (!data) return;
  if (who === "person") {
    message.channel.send({ content: `👑 | فاز الفريق الأول (المواطنين) في اللعبة.\n${data.players.filter(m => m.type != "mafia").map(b => `<@${b.id}>`).join(", ")}` });
  } else if (who === "mafia") {
    message.channel.send({ content: `👑 | فاز الفريق الثاني (المافيا) في اللعبة.\n${data.players.filter(m => m.type == "mafia").map(b => `<@${b.id}>`).join(", ")}` });
  }
  has_play.delete(message.guild.id);
}

function createMultipleButtons(array, type) {
  let components = [];
  let c = 5;
  for (let i = 0; i < array.length; i += c) {
    let buttons = array.slice(i, i + c);
    let component = new ActionRowBuilder()
    for (let button of buttons) {
      let btn = new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setLabel(button.label)
        .setCustomId(`${type}_${button.id}_${button.index}`)
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

module.exports = mafia_command;