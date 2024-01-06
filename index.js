let modlogModel = require('./modlogModel.js')
const {Client,GatewayIntentBits,REST, SlashCommandBuilder, Routes, ChannelType, PermissionsBitField,PermissionFlagsBits, EmbedBuilder,ActionRowBuilder,ButtonBuilder, ButtonStyle, Events,ActivityType } = require('discord.js');
const keepAlive = require('./keep_alive.js');
const noblox = require('noblox.js');
const moment = require('moment');
const momenttz = require('moment-timezone');
const os = require('os');
const mongoose = require('mongoose');
//const canvafy = require("canvafy");

const dotenv = process.env;
const logschannelid = dotenv.logschannel;
const announcechannelid = dotenv.announcechannel;
const bugreportschannelid = dotenv.bugreportschannel;

const mongodbuser = dotenv.mongodb;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent,GatewayIntentBits.GuildMessages]});
const token = dotenv.token;

const commands = [

  new SlashCommandBuilder().setName('verify').setDescription('Verifys your account').setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

  new SlashCommandBuilder().setName('help').setDescription('Lists all of the available commands.').setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

  new SlashCommandBuilder().setName('private_message').setDescription('Sends a private message to a user. Note that the message will be logged for security purposes.').addUserOption(option => option.setName('user').setDescription('User to send the message to').setRequired(true)).addStringOption( option => option.setName('message').setDescription('Content of the message').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  new SlashCommandBuilder().setName('send_bug_report').setDescription('Notifies the developers of a existing bug for a certain product or system.').addStringOption(option => option.setName('product_or_system').setDescription('The product / system that you are experiencing a bug with.').setRequired(true)).addStringOption(option => option.setName('bug').setDescription('What the bug is that is occurring with the product / system.').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

  new SlashCommandBuilder().setName('send_embed').setDescription('Sends a embedded message to the chosen channel within the server.').addStringOption(option => option.setName('message').setDescription('Message you wish to announce.').setRequired(true)).addStringOption(option => option.setName('mention_type').setDescription('"Everyone" for @everyone, "Here" for @here, and "None" for no pinging.').setRequired(true)).addChannelOption(option => option.setName('channel').setDescription('The channel for the embed to be setnt in.').setRequired(true)).addStringOption(option => option.setName('title').setDescription('Sets the title for the embed').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  new 
  SlashCommandBuilder().setName('purge').setDescription('Deletes an specificed amount of messages').addIntegerOption(option => option.setName('messages').setDescription('The amount of messages you wish to delete').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  new 
  SlashCommandBuilder().setName('create_ticket').setDescription('Creates a ticket').addStringOption(option => option.setName('reason').setDescription('The reason for creating a ticket.').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

  new 
  SlashCommandBuilder().setName('close_ticket').setDescription('Close a ticket').addChannelOption(option => option.setName('ticket').setDescription("Choose the ticket you wish to close").setRequired(true)).addStringOption(option => option.setName('reason').setDescription('The reason for closing the ticket.').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  new 
  SlashCommandBuilder().setName('remove_modlog').setDescription('Removes a modlog via the ID of the modlog').addStringOption(option => option.setName('modlogid').setDescription('The id of the warning that should be deleted').setRequired(true)).addStringOption(option => option.setName('reason').setDescription('The reason for removing the modlog').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new 
  SlashCommandBuilder().setName('view_modlogs').setDescription('Views the modlogs of a user.').addUserOption(option => option.setName('user').setDescription('To view the warnings and warning information of a user').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  new SlashCommandBuilder().setName('mute').setDescription('Times out / Mutes the user').addUserOption(option => option.setName('user').setDescription('The user to mute/timeout').setRequired(true)).addStringOption(option => option.setName('reason').setDescription('The reason for the mute/timeout').setRequired(true)).addNumberOption(option => option.setName('duration').setDescription('Duration for the timeout / mute (in minutes)').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  new
  SlashCommandBuilder().setName('unmute').setDescription('Removes the timeout / Unmutes the user').addUserOption(option => option.setName('user').setDescription('The user to unmute/un-timeout').setRequired(true)).addStringOption(option => option.setName('reason').setDescription('The reason for the unmute/un-timeout').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  new 
  SlashCommandBuilder().setName('warn').setDescription('Warns A User').addUserOption(option => option.setName('user').setDescription('The User To Warn').setRequired(true)).addStringOption(option => option.setName('reason').setDescription('The reason for the warn').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  new 
  SlashCommandBuilder().setName('kick').setDescription('Kicks a user').addUserOption(option => option.setName('user').setDescription("The user you wish to kick ").setRequired(true)).addStringOption(option => option.setName('reason').setDescription("The reason").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  new 
  SlashCommandBuilder().setName('ban').setDescription('Bans a user').addUserOption(option => option.setName('user').setDescription("The user you wish to ban").setRequired(true)).addStringOption(option => option.setName('reason').setDescription("The reason").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  new
  SlashCommandBuilder().setName('unban').setDescription('Unbans a user').addUserOption(option => option.setName('user').setDescription("The user you wish to unban").setRequired(true)).addStringOption(option => option.setName('reason').setDescription("The reason").setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  
].map(command => command.toJSON());
//-----------------------------------------------------
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function random (colors) {
  return colors [Math.floor (Math.random () * colors.length)];
};
//-----------------------------------------------------
const rest = new REST({ version: '10' }).setToken(token);

rest.put(Routes.applicationGuildCommands(dotenv.botclientid, dotenv.serverid), { body: commands })
	.then((data) => console.log(`Successfully registered ${data.length} application commands.`))
	.catch(console.error);

client.once('ready', () => {
	console.log('Ready!');
  client.user.setPresence({
  activities: [{ name: `SR Studio's`, type:       ActivityType.Watching }],
    status: 'online',
  });

  client.on('messageUpdate',(oldMessage,newMessage) => {
    if(oldMessage.content != newMessage.content){
      var editedtimestamp = (momenttz.tz(new Date(), "GMT").format("YYYY/MM/DD | HH:mm")).toString() + " GMT";
      var msgchannelstr = `<#${newMessage.channelId}>`;
      var channel = client.channels.cache.get(logschannelid);
      var msgEditedEmbed = new EmbedBuilder()
      .setAuthor({
        name: (newMessage.author.username + " (" + newMessage.author.id + ")").toString(),
        iconUrl: newMessage.author.displayAvatarURL(),
      })
       .setDescription("Type: **'Message'** \nOld Message: " +oldMessage.content + "\nNew Message: " + newMessage.content + "\n Channel: "+ msgchannelstr )
      .setTitle("Edited Message")
      .setColor('#ffff00')
      .setFooter({
         text: editedtimestamp
       });
      channel.send({embeds:[msgEditedEmbed]})
    }
  });

  client.on('messageDelete', message => {
    var deletedtimestamp = (momenttz.tz(new Date(), "GMT").format("YYYY/MM/DD | HH:mm")).toString() + " GMT";
    var deletedmsgchannelid = message.channelId;
    var msgchannelstr = `<#${deletedmsgchannelid}>`;
    var channel = client.channels.cache.get(logschannelid);
    if(message.content.length > 0){
      var deletedembed = new EmbedBuilder()
    .setAuthor({
      name: (message.author.username + " (" + message.author.id + ")").toString(),
      iconUrl: message.author.displayAvatarURL(),
    })
     .setDescription("Type: **'Message'** \n Message: " + message.content + "\n Channel: "+ msgchannelstr )
    .setTitle("Deleted Message")
    .setColor('#ff0000')
    .setFooter({
       text: deletedtimestamp
     });
    channel.send({embeds:[deletedembed]});
    };
    

    message.attachments.forEach(function(attachment){
      var deletedtimestamp = (momenttz.tz(new Date(), "GMT").format("YYYY/MM/DD | HH:mm")).toString() + " GMT";
      var deletedembed = new EmbedBuilder()
      .setAuthor({
          name: (message.author.username + " (" + message.author.id + ")").toString(),
          iconUrl: message.author.displayAvatarURL(),
      })
      .setDescription("Type: **'Attachment'** \n "+" Channel: "+ msgchannelstr )
      .setImage(attachment.proxyURL)
      .setTitle("Deleted Attachment")
      .setColor('#ff0000')
      .setFooter({
        text: deletedtimestamp
      });
      channel.send({embeds:[deletedembed]})
    });
  })
});

mongoose.connect(mongodbuser,{ useNewUrlParser: true, useUnifiedTopology: true }).then(() => console.log("Connected to MongoDB")).catch(err => {console.log("Could not connect to MongoDB: " + err)});


client.on(Events.InteractionCreate,async interaction => {

  if(interaction.isButton()){
    if(interaction.customId == 'verifybutton'){
      if(interaction.member.roles.cache.has("1023638886720745572")){
        await interaction.reply({content:"You are already verified.",ephemeral: true});
        /*const key = canvafy.Util.captchaKey(15) // 15 is length of captcha
        const captcha = await new canvafy.Captcha()
        .setBackground("image", "https://media.discordapp.net/attachments/1023695339737325758/1167629797401317466/SR_Studios_Verification_Banner.png?ex=654ed2fd&is=653c5dfd&hm=e11da89d0a80e18162b17509dea80048edace99326af58c06cc6114ba55a4e5e&=&width=2355&height=1325")
        .setCaptchaKey(key) 
        .setBorder(random(['#008000', '#E50000']))
        .setOverlayOpacity(0.7)
        .build();
        awaitingverification.push([interaction.member.userid,key])
        interaction.member.send({files: [{attachment: captcha,name: `captcha-${message.member.id}.png`}]})
        await interaction.reply({content: "Check your DM's for the captcha prompt.",ephemeral: true})
        return;*/
      }else{
        // logging it
          let botlogs = interaction.guild.channels.cache.get(dotenv.logschannel)
                                                                       botlogs.send("**<@"+interaction.member.id+">** has successfully verified their account.");
            // define verified roles
          const verifiedRole = interaction.guild.roles.cache.get("1023638886720745572");
          const emdash1 = interaction.guild.roles.cache.get("1024464369716826112");
          const emdash2 = interaction.guild.roles.cache.get("1024465147764408320");
          const communitymemRole = interaction.guild.roles.cache.get("1023639177406984374");
            // Add role to member
          interaction.member.roles.add(verifiedRole);
          interaction.member.roles.add(emdash1);
          interaction.member.roles.add(emdash2);
          interaction.member.roles.add(communitymemRole);
          await interaction.reply({content:"Successfully verified your account: **" +interaction.member.displayName+ " **to SR Studio's.", ephemeral: true});
            return;
        
          }
      }
  }

  var {commandName} = interaction;


  if (commandName == 'verify'){
    const preverembed = new EmbedBuilder()
    .setTitle("Verification")
    .setDescription("Loading....");
    await interaction.reply({embeds: [preverembed],ephemeral: true});
    
    sleep(5000);
    
    const embed = new EmbedBuilder()
      .setTitle("Verification")
      .setDescription("Click on the verify button below to get verified!");

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
        .setCustomId('verifybutton')
        .setStyle("Primary")
        .setEmoji("✅")
        .setLabel("Verify"),
      );
      await interaction.editReply({embeds: [embed], components: [row] , ephemeral: true} );
    
  }else if(commandName == "help"){
    const guild = client.guilds.cache.get('1023627474569007205')
    const guildcmds = guild.commands.cache;
    const promises = guildcmds.map(command => command.permissions.fetch());
    const permsArray = await Promise.all(promises);
    console.log(permsArray);
    var allcmds = "";
    var allperms = "";
    interaction.guild.commands.fetch()
  .then(commands => {
    commands.forEach(command => {
      allcmds = allcmds + "\n **Name: " + command.name + "**\n ```Description: " + command.description + "```";
    });

    permsArray.forEach((permissions, index) => {
      const command = commands[index];
      console.log(`Command: ${command.name}`);
      console.log(permissions);
    });
    
    const randomclr = Math.floor(Math.random()*16777215).toString(16);
    var cmdembed = new EmbedBuilder()
    .setTitle("All Commands")
    .setDescription(allcmds)
    //.setColor(randomclr);
    interaction.reply({embeds: [cmdembed],ephemeral: true})
  });
   
    
  }else if(commandName == "private_message"){
    const user = interaction.options.getUser('user');
    const msg = interaction.options.getString('message');
    if(user && msg){
      let botlogs = interaction.guild.channels.cache.get(dotenv.logschannel)
      user.send({content:`# **New Message From: ${interaction.user}**\n# Message: "${msg}"\n### *Note that SR Studio's is NOT responsible for anything said in the message, and that the user who sent the message should be held responsible for the contents of the message.*`})

      var pmembed = new EmbedBuilder()
      .setTitle("Private Message")
      .setDescription("**Message: " + msg + "**\n **To: " + `${user}` + "**\n" + '**Sent By: ' + `${interaction.user}**` + "\nTime: "+ momenttz.tz(new Date(), "GMT").format("YYYY/MM/DD | HH:mm").toString() + " GMT");
      
      botlogs.send({embeds: [pmembed]})

      await interaction.reply({content: `Successfully sent the message to: ${user}`,ephemeral: true})
    }
  }else if(commandName == "send_bug_report"){
    const system = interaction.options.getString("product_or_system");
    const bug = interaction.options.getString("bug");
    if(system && bug){
      var bugreportembed = new EmbedBuilder()
      .setTitle("Bug Report")
      .setDescription("**System: " + system + "**\n **Bug Description: " + bug + "**\n" + 'Reported By: ' + `${interaction.user}` + "\nTime: "+ momenttz.tz(new Date(), "GMT").format("YYYY/MM/DD | HH:mm").toString() + " GMT");
      let bugrprtschannel = interaction.guild.channels.cache.get(bugreportschannelid);
      bugrprtschannel.send({embeds:[bugreportembed]});
      interaction.reply({content: "Successfully made a bug report. The developers will be looking into the report shortly.",ephemeral: true});
    }else{
      interaction.reply({content: "Your bug report was made unsuccessfully. Make sure you filled out all of the fields.",ephemeral: true});
    }
  }else if(commandName == "send_embed"){
    const announcemessage = interaction.options.getString('message');
    //console.log(announcemessage);
    const announceauthor = interaction.member.user.username;
    const announceauthorid = interaction.member.user.id;
    const embedtitle = interaction.options.getString('title');
    var mentiontype = interaction.options.getString('mention_type');
    var announceembed = new EmbedBuilder()
      .setTitle(embedtitle)
      .setDescription("**Message: " + announcemessage + "**\n This message was posted by: "+announceauthor + " ("+announceauthorid+")"+"\n Date: "+ (momenttz.tz(new Date(), "GMT").format("YYYY/MM/DD | HH:mm")).toString() + " GMT"),

    mentiontype = mentiontype.toLowerCase();

    if(mentiontype == "none" || mentiontype == "here" || mentiontype == "everyone"){
      let targannouncechannel = interaction.options.getChannel('channel');
      let botlogs = interaction.guild.channels.cache.get(logschannelid);
      if(mentiontype == "none"){
        targannouncechannel.send({embeds: [announceembed]})
      }else if(mentiontype == "here"){
        targannouncechannel.send({content: "@here",embeds: [announceembed]});
      }else if(mentiontype == "everyone"){
        targannouncechannel.send({content: "@everyone", embeds: [announceembed]});
      }
      await interaction.reply({content: "Your message has been successfully posted in: <#"+targannouncechannel.id+">",ephemeral: true});
      botlogs.send("**<@"+interaction.member.id+">** has announced the message: **"+announcemessage+"** to the channel: <#"+targannouncechannel.id+">");
    }else{
      await interaction.reply({content: "Invalid parameters for the mention type were entered",ephemeral: true});
    }
    
  }else if(commandName == "create_ticket"){
    interaction.reply({content: "Creating Ticket Please Wait.......", ephemeral: true})
    await sleep(1000);

    const userName = interaction.member.user.username;
    const userId = interaction.member.id
    const channelName = userName+"-"+userId
    const reason = interaction.options.getString('reason')

    const ticketcategory = interaction.guild.channels.cache.get('1025510205003403285')
    const supportstaffroleid = interaction.guild.roles.cache.get(dotenv.supportroleid).id

    let botlogs = interaction.guild.channels.cache.get(logschannelid)
  

    await interaction.guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: ticketcategory.id,
    permissionOverwrites: [
      {
        id: dotenv.everyoneroleid,
        deny:[
          PermissionsBitField.Flags.ViewChannel,
        ],
      },
        {
            id: interaction.member.id, 
            
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
        },
      {
            id: supportstaffroleid, 
            
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
        },
    ],
}).then(result => {interaction.guild.channels.cache.get(result.id).send("<@"+interaction.member.id+"> has created this ticket for the following reason: **"+reason+"**" ),
      interaction.guild.channels.cache.get(result.id).send("***<@&"+supportstaffroleid+"> __will be helping you out shortly.__***" ),
      botlogs.send("**<@"+interaction.member.id+">** has created the ticket: **<#"+result.id+">**"),
      
      interaction.editReply({content: 'Successfully created your ticket. <#'+result.id+'>', ephemeral: true})}).catch(err => {interaction.editReply({content: "Unable to create ticket due to a unknown error.",ephemeral: true})});
  
  }else if(commandName === "close_ticket"){
    
    ticketchannel = interaction.options.getChannel('ticket')
    await interaction.reply({content: "Attempting to delete the ticket. Please wait.....", ephemeral: true})
    reason = interaction.options.getString('reason')
    

    if(ticketchannel.parentId === "1025510205003403285"){
      
      if(!ticketchannel.name.includes("how-to-create-a-ticket")){
        
        let botlogs = interaction.guild.channels.cache.get(dotenv.logschannel);

      const ticketname = ticketchannel.name
      const ticketparentid = ticketchannel.parentId

      
                                                                 
      ticketchannel.delete()
      botlogs.send("**<@"+interaction.member.id+">** has successfully closed the ticket: **<#"+ticketparentid+">** ("+ticketname+") for the following reason: ***"+reason+"***")
        
      } else {
      interaction.editReply({content: "Could not close the ticket. Please make sure that this is a valid ticket and not just some random channel within the server.", ephemeral: true})
    }
      
    } else {
      interaction.editReply({content: "Could not close the ticket. Please make sure that this is a valid ticket and not just some random channel within the server.", ephemeral: true});
    }
  }else if(commandName == 'purge'){
    const amount = interaction.options.getInteger('messages');
    if(amount<=100){

          interaction.channel.bulkDelete(amount).catch(err => {
             interaction.reply({content: "Due to Discord's limitations, I am unable to delete messages older than 14 days.", ephemeral: true});
          });
      if(interaction.replied){
        await interaction.editReply({content: "Successfully deleted: **"+amount+"** messages.",ephemeral: true});
      }else{
        await interaction.reply({content: "Successfully deleted: **"+amount+"** messages.",ephemeral: true});
      }
          

          let botlogs = interaction.guild.channels.cache.get(logschannelid)

          let targchannel = interaction.channel.id;
          
                                                                 botlogs.send("**<@"+interaction.member.id+">** successfully purged: **"+amount+"** messages in: <#"+targchannel+">")
			
			
        } else {
          await interaction.reply({content: "Too many messages. The limit for purging messages is 100 messages per 1 purge.", ephemeral: true})
        };
    
  }else if(commandName == 'mute'){

    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');
    const timeoutduration = interaction.options.getNumber('duration');

    const timestamp = (momenttz.tz(new Date(), "GMT").format("YYYY/MM/DD | HH:mm")).toString() + " GMT";

    new modlogModel({
      userId: target.id,
      type: "Mute / Timeout",
      guildId: interaction.guild.id,
      reason,
      moderatorId: userid,
      timestamp: timestamp,
      duration: (timeoutduration * 60 * 1000).toString() + "minutes ",
      
    }).save();

    target.timeout(timeoutduration * 60 * 1000, reason);

    interaction.reply({content: "Successfully Timed-Out / Muted The User" ,ephemeral: true});

    target.send("You have been timed-out / muted for: **"+reason+"** in __*** SR Studio's ***__").catch(err => {console.log("Could not DM the user: <@"+target.id+">")})

    let botlogs = interaction.guild.channels.cache.get(logschannelid);
                                                                 botlogs.send("**<@"+interaction.member.id+">** has timed-out / muted the user: **<@"+target.id+">** for the following reason: **"+reason+"**")

    
    
  }else if(commandName == 'unmute'){
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');

    const timestamp = (momenttz.tz(new Date(), "GMT").format("YYYY/MM/DD | HH:mm")).toString() + " GMT";
    
    new modlogModel({
      userId: target.id,
      type: "Unmute / Un-timed-out",
      guildId: interaction.guild.id,
      reason,
      moderatorId: userid,
      timestamp: timestamp,
      duration: "Permanent",
      
    }).save();

    target.timeout(null, reason);

    interaction.reply({content: "Successfully Un-timed-Out / Unmuted The User" ,ephemeral: true});

    target.send("You have been un-timed-out / unmuted for: **"+reason+"** in __*** SR Studio's ***__").catch(err => {console.log("Could not DM the user: <@"+target.id+">")})

    let botlogs = interaction.guild.channels.cache.get(logschannelid);
                                                                 botlogs.send("**<@"+interaction.member.id+">** has un-timed-out / unmuted the user: **<@"+target.id+">** for the following reason: **"+reason+"**")
  }else if(commandName === 'warn'){

    const username = interaction.member.user.username
    const userid = interaction.member.id
    const target = interaction.options.getUser('user')
    const reason = interaction.options.getString('reason')


    const timestamp = (momenttz.tz(new Date(), "GMT").format("YYYY/MM/DD | HH:mm")).toString() + " GMT";

    new modlogModel({
      userId: target.id,
      type: "Warn",
      guildId: interaction.guild.id,
      reason,
      moderatorId: userid,
      timestamp: timestamp,
      duration: "Permanent",
      
    }).save();
    interaction.reply({content: "Successfully Warned The User" ,ephemeral: true});

    target.send("You have been warned for: **"+reason+"** in __*** SR Studio's ***__").catch(err => {console.log("Could not DM the user: <@"+target.id+">")})

    let botlogs = interaction.guild.channels.cache.get(logschannelid);
                                                                 botlogs.send("**<@"+interaction.member.id+">** has warned the user: **<@"+target.id+">** for the following reason: **"+reason+"**")
    
  } else if(commandName === 'kick'){
    const member = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason');
    const username = interaction.member.user.username;
    const userid = interaction.member.id;
     await interaction.reply({content: "Executing the command....", ephemeral: true})
        sleep(1000);


        if(member){
          
          var id = member.id;
          
          member.send("An attempt was made to successfully/unsuccessfully **kick** you from SR Studio's for: **"+reason+"**. ").catch(err => {interaction.editReply({content: "Could not DM the user.", ephemeral: true})});
          await interaction.editReply({content: "Successfully kicked the user: **<@"+id+">** for: **"+reason+"**", ephemeral: true});
          const timestamp = (momenttz.tz(new Date(), "GMT").format("YYYY/MM/DD | HH:mm")).toString() + " GMT";

          new modlogModel({
            userId: member.id,
            type: "Kick",
            guildId: interaction.guild.id,
            reason,
            moderatorId: userid,
            timestamp: timestamp,
            duration: "Permanent",
          }).save();
          
            let botlogs = interaction.guild.channels.cache.get(logschannelid)
                                                                 await botlogs.send("**<@"+interaction.member.id+">** executed the kick command on: **<@"+id+">**")
          
          member.kick().catch(err => {
          interaction.editReply({content: "Could not kick the user.", ephemeral: true})
        }) 
        } else {
          await interaction.editReply({content: "User not found.",ephemeral: true})
        }
    
  } else if(commandName === "ban"){
    const username = interaction.member.user.username
    const userid = interaction.member.id
    const target = interaction.options.getUser('user')
    const targid = target.id
    const reason = interaction.options.getString('reason')

    await interaction.reply({content: "Executing command. Please wait.....", ephemeral: true})

    if(target && targid || interaction.guild.members.cache.get(target).bannable){
      const timestamp = (momenttz.tz(new Date(), "GMT").format("YYYY/MM/DD | HH:mm")).toString() + " GMT";

      new modlogModel({
        userId: targid,
        type: "Ban",
        guildId: interaction.guild.id,
        reason,
        moderatorId: userid,
        timestamp: timestamp,
        duration: "Permanent",
      
    }).save().catch(err => {console.log("Could not save modlog")});

      target.send("An attempt to ban you was successful/unsuccessful from __*** SR Studio's ***__ for: **"+reason+"** ").catch(err => {console.log("Could not DM the user: <@"+target.id+">")})

      let botlogs = interaction.guild.channels.cache.get(dotenv.logschannel);
                                                                 botlogs.send("**<@"+interaction.member.id+">** successfully/unsuccessfully banned the user: **<@"+targid+">**");

      interaction.editReply({content: "The ban hammer has spoken."});


      interaction.guild.members.ban(targid, {reason: reason}).catch(err => {interaction.editReply({content: "Could not ban the user",ephemeral: true})});
      
    } else {
      interaction.editReply({content: "Could not ban the user", ephemeral: true})
    }
    
  }else if(commandName == 'unban'){
    const username = interaction.member.user.username
    const userid = interaction.member.id
    const target = interaction.options.getUser('user')
    const targid = target.id
    const reason = interaction.options.getString('reason')

     await interaction.reply({content: "Executing command. Please wait.....", ephemeral: true})

    if(target && targid || interaction.guild.members.cache.get(target).unbannable){
      const timestamp = (momenttz.tz(new Date(), "GMT").format("YYYY/MM/DD | HH:mm")).toString() + " GMT";

      new modlogModel({
        userId: targid,
        type: "Unban",
        guildId: interaction.guild.id,
        reason,
        moderatorId: userid,
        timestamp: timestamp,
        duration: "Permanent",
      
    }).save().catch(err => {console.log("Could not save modlog")});

      let botlogs = interaction.guild.channels.cache.get(dotenv.logschannel);
                                                                 botlogs.send("**<@"+interaction.member.id+">** successfully/unsuccessfully unbanned the user: **<@"+targid+">**");

      interaction.editReply({content: "The unban hammer has spoken."});


      interaction.guild.members.unban(targid,{reason: reason}).catch(err => {interaction.editReply({content: "Could not unban the user",ephemeral: true})});
      
    } else {
      interaction.editReply({content: "Could not unban the user", ephemeral: true})
    }
    
  }else if(commandName === 'remove_modlog'){

    await interaction.reply({content: "Finding modlog. Please wait......", ephemeral: true});
    const modlogid = interaction.options.getString('modlogid');
    const reason = interaction.options.getString('reason');

    const data = await modlogModel.findById(modlogid);
    

    if(!data){
      return interaction.editReply({content: "Could not find the modlog: **"+modlogid+"** Please make sure you inputted a valid id.",ephemeral: true})
    } else {
      data.delete();
      const user = interaction.guild.members.cache.get(data.userId);

      botlogs = interaction.guild.channels.cache.get(logschannelid)
                                                                 botlogs.send(`Successfully deleted the modlog: **`+modlogid+`** for: ${user} for the following reason: ***`+reason+`***`)
      
      return interaction.editReply({content: `Successfully deleted the warn: **`+modlogid+`** for: ${user}`,ephemeral: true});

      
    }
    
  }else if(commandName === "view_modlogs"){
    const targ = interaction.options.getUser('user')
    const targname = targ.username
    await interaction.reply({content: "Getting modlogs from <@"+targ.id+">. Please wait..........", ephemeral: true})
    const usermodlogs = await modlogModel.find({
      userId: targ.id, 
      guildId: interaction.guild.id})

    if(!usermodlogs?.length)return interaction.editReply({content: "Could not find any modlogs for the user: <@"+targ.id+">", ephemeral: true})

    const embedDescription = usermodlogs.map((modlogs) => {
      const moderator = interaction.guild.members.cache.get(
        modlogs.moderatorId
      );

      const type = modlogs.type;
      return[
        `ModlogId: ${modlogs._id}`,
        `Type: ${type}`,
        `Moderator: ${moderator || 'Has Left'}`,
        `Date: ${modlogs.timestamp}`,
        `Reason: ${modlogs.reason}`,
        `Duration: ${modlogs.duration}`,
        
        
      ].join("\n");
    }).join("\n\n");


    const embed = new EmbedBuilder()
    .setColor(random(['#008000', '#E50000']))
    .setTitle(targname + "'s modlogs")
    .setDescription(embedDescription);
    


    interaction.editReply({content: "Here are <@"+targ.id+">'s modlogs", ephemeral: true})
    interaction.editReply({embeds: [embed]})
  }
})
//-----------------------------------------------------

try{
  client.login(token)
}
catch(err){os.system("kill 1")};
keepAlive();







