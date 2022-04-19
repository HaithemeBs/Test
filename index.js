const express = require("express");
const app = express();
const Discord = require('discord.js');
const client = new Discord.Client();
const smith = require(`probot-tax`);
const config = require(`./config.json`);
const db = require(`quick.db`);
const prefix = `+`;
let msgid = ``;//matkhrbch fi hadi
client.on('ready', () => {
  console.log(`Logged Us : ${client.user.tag}`);
  var account = db.get(`accounts`)
  let stock = ``;
  let status = ``;
  if (!account || account.length === 0) {
    stock = `📈Out of stock`
    status = `⭕ Status: Offline`
  } else if (account.length > 0) {
    stock = `📈 Netflix St: ${account.length}`
    status = `✅ Status: Online`
  }
  var channel = client.channels.cache.get(config.channel_id)
  var smithembed = new Discord.MessageEmbed()
    .setTitle(`كيف اشتري حساب من البوت :`)
    .setColor(`#025E7C`)
    .setDescription(`**كيف تشتري نتفلكس شهر تجربة :**

    قم بكتابة هادا الامر في هده الروم
    #credits 762713645410287616 ${smith.taxs(config.account_price)}
    #credits @!MS       MAYLO#9260 ${smith.taxs(config.account_price)}
    
    ثم ادخل الرقم الدي سيضهر لك و ستتلقى رسالة من البوت في خاصك
    تحمل الحساب الي شريته
    
    **تنويهات :**
    1 - \`افتح خاصك قبل الشراء\`
    2 - \`اي رسالة غير التحويل سيتم حدفها تلقائيا و ممنوع\`
    3 - \`لا يوجد اي امر فقط حول و سيصلك الحساب\`
    4 - \`لن تستلم التعويض بعد مرور 5 دقائق من شراء الحساب\``)
    .setImage(`https://cdn.discordapp.com/attachments/965715611894308924/965854735586435162/unnamed.jpg`)
    .setFooter(stock + ` ` + status);

  channel.send(smithembed).then(msg => {
    msgid = msg.id
    setInterval(() => {
      var account = db.get(`accounts`)
      let stock = ``;
      let status = ``;
      if (!account || account.length === 0) {
        stock = `📈Out of stock`
        status = `⭕ Status: Offline`
      } else if (account.length > 0) {
        stock = `📈 Netflix St: ${account.length}`
        status = `✅ Status: Online`
      }
      var smithembed = new Discord.MessageEmbed()
        .setTitle(`كيف اشتر حساب من البوت :`)
        .setColor(`#025E7C`)
        .setDescription(`**كيف تشتري نتفلكس شهر تجربة :**
        
            قم بكتابة هادا الامر في هده الروم
            #credits ${config.owner_id} ${smith.taxs(config.account_price)}
            
            ثم ادخل الرقم الدي سيضهر لك و ستتلقى رسالة من البوت في خاصك
            تحمل الحساب الي شريته
            
            **تنويهات :**
            1 - \`افتح خاصك قبل الشراء\`
            2 - \`اي رسالة غير التحويل سيتم حدفها تلقائيا و ممنوع\`
            3 - \`لا يوجد اي امر فقط حول و سيصلك الحساب\`
            4 - \`لن تستلم التعويض بعد مرور 5 دقائق من شراء الحساب\``)
        .setImage(`https://cdn.discordapp.com/attachments/965715611894308924/965854735586435162/unnamed.jpg`)
        .setFooter(stock + ` ` + status);
      msg.edit(smithembed).then(() => {
        console.log(`Done Refresh`)
      })
    }, 1000 * 10)
  })
});

client.on('message', smithmsg => {
  if (smithmsg.id === msgid) return;
  if (smithmsg.channel.id === config.channel_id) {
    setTimeout(() => {
      if (smithmsg.id === msgid) return;
      smithmsg.delete().catch(err => console.log(`i can't delete message`))
    }, 5000)
    if (smithmsg.author.bot) return;
    let status = ``;
    smithmsg.member.send(`جيت اشوف اذا خاصك مفتوح او لا .`).then(msg => {
      msg.delete()
      status = `true`
    }).catch(err => {
      status = `false`
    });

    var err = new Discord.MessageEmbed()
      .setColor(`RED`)
      .setDescription(`Open Your DM First !!!`);

    if (status === `false`) return smithmsg.reply(err);
    var account = db.get(`accounts`);
    if (!account || account.length === 0) return;
    let filter = response => response.author.id == config.probot_id;
    smithmsg.channel.awaitMessages(filter, { max: 1 }).then(collected => {
      let filter2 = response => response.author.id == config.probot_id;
      smithmsg.channel.awaitMessages(filter2, { max: 1 }).then(collected2 => {
        console.log(collected2.first().content)
        if (collected2.first().content === `**:moneybag: | ${smithmsg.member.user.username}, has transferred \`$${Number(config.account_price)}\` to <@!${config.owner_id}> **`) {
          var smith_lst = account.filter(accs => accs != account[0]);
          db.set(`accounts`, smith_lst)
          var smithembed = new Discord.MessageEmbed()
            .setColor(`BLUE`)
            .setFooter(smithmsg.member.user.username, smithmsg.member.user.avatarURL())
            .setTimestamp()
            .addField(`Your Account`, `${account[0]}`);
          smithmsg.member.send(smithembed).catch(err => {
            console.log(err)
          })

          var channel_log = client.channels.cache.get(config.log_channel_id)
          var embedlog = new Discord.MessageEmbed()
            .setTitle(`سجلات عميلات البيع`)
            .addField(`اسم العميل`, smithmsg.member.user, true)
            .addField(`ايدي العميل`, smithmsg.member.user.id, true)
            .addField(`معلومات الحساب`, account[0], false)
            .setTimestamp();

          channel_log.send(embedlog)
        }
      }).catch(err2 => {
        console.log(err2)
      })
    }).catch(err2 => {
      console.log(err2)
    })
  }
  if (!smithmsg.content.startsWith(prefix) || smithmsg.author.bot) return;

  const args = smithmsg.content.slice(prefix.length).trim().split(' ');
  const message = args.slice(1).join(" ").split(`\n`);
  const command = args.shift().toLowerCase();
  const mention = client.users.cache.get(args[0]) || smithmsg.mentions.users.first()

  if (command === `addaccount`) {
    if (smithmsg.author.id != config.owner_id) return;
    var smitherr = new Discord.MessageEmbed()
      .setColor(`RED`)
      .setDescription(`${config.prefix}${command} <email:pass>`);
    if (!message) return smithmsg.reply(smitherr);

    if (!db.has(`accounts`)) {
      db.set(`accounts`, [])
    }

    let i = 0;
    while (i < message.length) {
      db.push(`accounts`, message[i])
      i++
    }

    var account = db.get(`accounts`);
    var smithembed = new Discord.MessageEmbed()
      .setColor(`GREEN`)
      .setDescription(`\`${message.length}\` added to database.`);

    smithmsg.reply(smithembed)
  } else if (command === `delaccounts`) {
    if (smithmsg.author.id != config.owner_id) return;
    db.delete(`accounts`)
    var smithembed = new Discord.MessageEmbed()
      .setColor(`GREEN`)
      .setDescription(`لقد تم مسح كل الحسابات من المخزون بنجاح.`);

    smithmsg.reply(smithembed)
  } else if (command === `give`) {
    if (smithmsg.author.id != config.owner_id) return;
    if (!mention) return;
    var account = db.get(`accounts`);
    if (!account || account.length === 0) return;

    var smith_lst = account.filter(accs => accs != account[0]);
    db.set(`accounts`, smith_lst)

    var smithembed = new Discord.MessageEmbed()
      .setColor(`BLUE`)
      .setFooter(smithmsg.member.user.username, smithmsg.member.user.avatarURL())
      .setTimestamp()
      .addField(`Your Account`, `${account[0]}`);
    mention.send(smithembed).catch(err => {
      smithmsg.reply(`DM CLOSED !!!`)
    });

    var channel_log = client.channels.cache.get(config.log_channel_id)
    var embedlog = new Discord.MessageEmbed()
      .setTitle(`سجلات عميلات البيع`)
      .addField(`اسم العميل`, smithmsg.member.user, true)
      .addField(`ايدي العميل`, smithmsg.member.user.id, true)
      .addField(`معلومات الحساب`, account[0], false)
      .setTimestamp();

    channel_log.send(embedlog)


    var smithembed = new Discord.MessageEmbed()
      .setColor(`GREEN`)
      .setDescription(`لم تم ارسال له حساب في الخاص بنجاح.`);

    smithmsg.reply(smithembed)
  } else if (command === `stock`) {
    var account = db.get(`accounts`)
    let text = ``;
    if (!account || account.length === 0) {
      text = `Out of stock`
    } else if (account.length > 0) {
      text = `${account.length}`
    }
    var smithembed = new Discord.MessageEmbed()
      .setColor(`GREEN`)
      .setAuthor(smithmsg.author.username, smithmsg.author.avatarURL())
      .setTimestamp()
      .addField(`📈 الحسابات المتوفرة`, text);

    smithmsg.reply(smithembed)
  }

});


client.login(config.token);