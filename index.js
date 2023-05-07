// Discord and Modules
const { PermissionsBitField, EmbedBuilder, ButtonStyle, Client, GatewayIntentBits, ChannelType, Partials, ActionRowBuilder, SelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType, SelectMenuInteraction, ButtonBuilder, AuditLogEvent } = require("discord.js");

// İNTENTS
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.GuildIntegrations, GatewayIntentBits.GuildWebhooks, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.DirectMessageTyping, GatewayIntentBits.MessageContent], shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember, Partials.Reaction, Partials.GuildScheduledEvent, Partials.User, Partials.ThreadMember] });
// Database
const db = require("croxydb")

global.client = client;
client.commands = (global.commands = []);
const { readdirSync } = require("fs")
const { TOKEN } = require("./config.json");
readdirSync('./commands').forEach(f => {
    if (!f.endsWith(".js")) return;

    const props = require(`./commands/${f}`);

    client.commands.push({
        name: props.name.toLowerCase(),
        description: props.description,
        options: props.options,
        dm_permission: false,
        type: 1
    });

    console.log(`[COMMAND] ${props.name} komutu yüklendi.`)

});
readdirSync('./events').forEach(e => {

    const eve = require(`./events/${e}`);
    const name = e.split(".")[0];

    client.on(name, (...args) => {
        eve(client, ...args)
    });
    console.log(`[EVENT] ${name} eventi yüklendi.`)
});

const InvitesTracker = require('@androz2091/discord-invites-tracker');
const tracker = InvitesTracker.init(client, {
    fetchGuilds: true,
    fetchVanity: true,
    fetchAuditLogs: true
});

client.login(TOKEN)

// Bir Hata Oluştu
process.on("unhandledRejection", (reason, p) => {
    console.log(reason, p);
})

process.on("unhandledRejection", async (error) => {
    return console.log("Bir hata oluştu! " + error)
})


tracker.on('guildMemberAdd', (member, type, invite) => {

    const data = db.get(`davetLog_${member.guild.id}`)
    if (!data) return;
    const inviteChannel = member.guild.channels.cache.get(data.channel);
    if (!inviteChannel) return db.delete(`davetLog_${member.guild.id}`); // ayarlanan kanal yoksa sistemi sıfırlar

    const invitedMember = db.get(`invitedİnfo_${member.id}_${member.guild.id}`)
    if (invitedMember) {
        if (data.message === "embed") {

            const invite_embed = new EmbedBuilder()
                .setColor("DarkButNotBlack")
                .setAuthor({ name: `${member.user.username} giriş yaptı` })
                .setDescription(`Hoşgeldin ${member}! Daha önce <@${invitedMember.inviterİd}> tarafından davet edilmişsin! :tada:\n\n> **discord.gg/${invitedMember.inviteCode}** linkiyle giriş yapmıştın.`)
                .setFooter({ text: `${invite.inviter.username} tarafından davet edildi` })
                .setTimestamp()

            db.add(`inviteCount_${invitedMember.inviterİd}_${member.guild.id}`, 1)
            db.add(`inviteRemoveCount_${invitedMember.inviterİd}_${member.guild.id}`, -1)
            return inviteChannel.send({ embeds: [invite_embed] })
        }

        if (data.message === "mesaj" && member.user.id === invite.inviter.id) {
            db.add(`inviteCount_${invitedMember.inviterİd}_${member.guild.id}`, 1)
            db.add(`inviteRemoveCount_${invitedMember.inviterİd}_${member.guild.id}`, -1)
            return inviteChannel.send({ content: `Hoşgeldin ${member}! Daha önce <@${invitedMember.inviterİd}> tarafından davet edilmişsin! :tada:` })
        }
    }

    if (type === 'normal') {

        if (data.message === "embed" && member.user.id === invite.inviter.id) {
            const invite_embed = new EmbedBuilder()
                .setColor("DarkButNotBlack")
                .setAuthor({ name: `${member.user.username} giriş yaptı` })
                .setDescription(`Hoşgeldin ${member}! Adam kendi kendini davet etmiş :tada:\n\n> **discord.gg/${invite.code}** linkiyle giriş yaptı.`)
                .setFooter({ text: `Kendi kendini davet etmiş.` })
                .setTimestamp()

            return inviteChannel.send({ embeds: [invite_embed] })
        }

        if (data.message === "mesaj" && member.user.id === invite.inviter.id) {
            return inviteChannel.send({ content: `Hoşgeldin ${member}! Adam kendi kendini davet etmiş :tada:` })
        }

        if (data.message === "embed") {

            const invite_embed = new EmbedBuilder()
                .setColor("DarkButNotBlack")
                .setAuthor({ name: `${member.user.username} giriş yaptı` })
                .setDescription(`Hoşgeldin ${member}! **${invite.inviter.username}** sayesinde buradasın! :tada:\n\n> **discord.gg/${invite.code}** linkiyle giriş yaptı.`)
                .setFooter({ text: `${invite.inviter.username} tarafından davet edildi` })
                .setTimestamp()

            db.set(`invitedİnfo_${member.id}_${member.guild.id}`, { inviterİd: invite.inviter.id, inviteCode: invite.code })
            db.add(`inviteCount_${invite.inviter.id}_${member.guild.id}`, 1)
            return inviteChannel.send({ embeds: [invite_embed] })
        }

        if (data.message === "mesaj") {
            db.set(`invitedİnfo_${member.id}_${member.guild.id}`, { inviterİd: invite.inviter.id, inviteCode: invite.code })
            db.add(`inviteCount_${invite.inviter.id}_${member.guild.id}`, 1)
            return inviteChannel.send({ content: `Hoşgeldin ${member}! **${invite.inviter.username}** sayesinde buradasın! :tada:` })
        }
    }

    else if (type === 'permissions') {
        if (data.message === "embed") {
            const invite_embed = new EmbedBuilder()
                .setColor("DarkButNotBlack")
                .setAuthor({ name: `${member.user.username} giriş yaptı` })
                .setDescription(`Hoşgeldin ${member}! Sunucuyu yönet yetkim olmadığı için nasıl geldiğini bulamadım!`)
                .setFooter({ text: `Nasıl davet edildiğini bulamadım, yetkim yok` })
                .setTimestamp()

            return inviteChannel.send({ embeds: [invite_embed] })
        }

        if (data.message === "mesaj") {
            return inviteChannel.send({ content: `Hoşgeldin ${member}! Sunucuyu yönet yetkim olmadığı için nasıl geldiğini bulamadım!` })
        }
    }

    else if (type === 'unknown') {
        if (data.message === "embed") {
            const invite_embed = new EmbedBuilder()
                .setColor("DarkButNotBlack")
                .setAuthor({ name: `${member.user.username} giriş yaptı` })
                .setDescription(`Hoşgeldin ${member}! Nasıl geldiğini bulamadım, gökten mi indin? :tada:`)
                .setFooter({ text: `Nasıl geldi anlamadım, kimsede söylemiyor` })
                .setTimestamp()

            return inviteChannel.send({ embeds: [invite_embed] })
        }

        if (data.message === "mesaj") {
            return inviteChannel.send({ content: `Hoşgeldin ${member}! Nasıl geldiğini bulamadım, gökten mi indin? :tada:` })
        }
    }
})
//
//
client.on('guildMemberRemove', (member) => {

    const data = db.get(`davetLog_${member.guild.id}`)
    if (!data) return;
    const inviteChannel = member.guild.channels.cache.get(data.channel);
    if (!inviteChannel) return db.delete(`davetLog_${member.guild.id}`); // ayarlanan kanal yoksa sistemi sıfırlar

    const invitedMember = db.get(`invitedİnfo_${member.id}_${member.guild.id}`)
    if (invitedMember) {
        if (data.message === "embed") {
            const invite_embed = new EmbedBuilder()
                .setColor("DarkButNotBlack")
                .setAuthor({ name: `${member.user.username} çıkış yaptı` })
                .setDescription(`Görüşürüz ${member}! <@${invitedMember.inviterİd}> tarafından davet edilmişti! :neutral_face:\n\n> **discord.gg/${invitedMember.inviteCode}** linkiyle giriş yapmıştı.`)
                .setFooter({ text: `Uf ya adam gitti valla, ${member.guild.memberCount} kişi kaldık` })
                .setTimestamp()

            db.add(`inviteRemoveCount_${invitedMember.inviterİd}_${member.guild.id}`, 1)
            db.add(`inviteCount_${invitedMember.inviterİd}_${member.guild.id}`, -1)
            return inviteChannel.send({ embeds: [invite_embed] })
        }

        if (data.message === "mesaj" && member.user.id === invite.inviter.id) {
            db.add(`inviteRemoveCount_${invitedMember.inviterİd}_${member.guild.id}`, 1)
            db.add(`inviteCount_${invitedMember.inviterİd}_${member.guild.id}`, -1)
            return inviteChannel.send({ content: `Görüşürüz ${member}! <@${invitedMember.inviterİd}> tarafından davet edilmişti! :neutral_face:` })
        }
    } else {
        if (data.message === "embed") {

            const invite_embed = new EmbedBuilder()
                .setColor("DarkButNotBlack")
                .setAuthor({ name: `${member.user.username} çıkış yaptı` })
                .setDescription(`Görüşürüz ${member}! Kim davet etti ne oldu bilmiyorum valla. :neutral_face:`)
                .setFooter({ text: `Uf ya adam gitti valla, ${member.guild.memberCount} kişi kaldık` })
                .setTimestamp()

            return inviteChannel.send({ embeds: [invite_embed] })
        }

        if (data.message === "mesaj" && member.user.id === invite.inviter.id) {
            return inviteChannel.send({ content: `Görüşürüz ${member}! Kim davet etti ne oldu bilmiyorum valla. :neutral_face:` })
        }
    }
})