import { Client, GatewayIntentBits, Partials, EmbedBuilder, Events, AuditLogEvent, PermissionsBitField, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js"
import "dotenv/config"
import path from "path"
import express from "express"
import { fileURLToPath } from "url"
import fs from "fs"
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express()
app.use("/", express.static(path.join(__dirname, "public")))
const port = process.env.PORT || 4000
app.listen(port, () => {
    console.log(`Server läuft auf Port ${port}`)
})
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.DirectMessages
    ],
    partials: [
        Partials.Channel, Partials.Message, Partials.Reaction, 
    Partials.GuildMember, Partials.User, Partials.ThreadMember
    ]
});
const ISTORAGE_CHANNEL_ID = "1474141512165097616";

let storageMessageI = null;
let dataI = {};

export async function initInvitesStorage(client) {
  const channel = await client.channels.fetch(ISTORAGE_CHANNEL_ID).catch(() => null);
  if (!channel || !channel.isTextBased()) return;

  const messages = await channel.messages.fetch({ limit: 20 });
  storageMessageI = messages.find(
    m => m.author.id === client.user.id && m.embeds.length > 0
  );

  if (!storageMessageI) {
    dataI = { _init: true };
    const embed = new EmbedBuilder()
      .setTitle("Storage")
      .setDescription("```json\n" + JSON.stringify(dataI) + "\n```");

    storageMessageI = await channel.send({ embeds: [embed] });
  } else {
    try {
      const raw = storageMessageI.embeds[0].description
        .replace("```json\n", "")
        .replace("\n```", "");

      dataI = JSON.parse(raw);
    } catch {
      dataI = { _init: true };
    }
  }
}

export function getIData(key) {
  return dataI[key];
}

export async function setIData(key, value) {
  if (!storageMessageI) return;

  dataI[key] = value;

  const jsonString = JSON.stringify(dataI);

  const embed = new EmbedBuilder()
    .setTitle("Storage")
    .setDescription("```json\n" + jsonString + "\n```");

  await storageMessageI.edit({ embeds: [embed] }).catch(console.error);
  
}
const MSTORAGE_CHANNEL_ID = "1474146608915681384";

let storageMessageM = null;
let dataM = {};

export async function initModerationStorage(client) {
  const channel = await client.channels.fetch(MSTORAGE_CHANNEL_ID).catch(() => null);
  if (!channel || !channel.isTextBased()) return;

  const messages = await channel.messages.fetch({ limit: 20 });
  storageMessageM = messages.find(
    m => m.author.id === client.user.id && m.embeds.length > 0
  );

  if (!storageMessageM) {
    dataM = { _init: true };
    const embed = new EmbedBuilder()
      .setTitle("Storage")
      .setDescription("```json\n" + JSON.stringify(dataM) + "\n```");

    storageMessageM = await channel.send({ embeds: [embed] });
  } else {
    try {
      const raw = storageMessageM.embeds[0].description
        .replace("```json\n", "")
        .replace("\n```", "");

      dataM = JSON.parse(raw);
    } catch {
      dataM = { _init: true };
    }
  }
}

export function getMData(key) {
  return dataM[key];
}

export async function setMData(key, value) {
  if (!storageMessageM) return;

  dataM[key] = value;

  const jsonString = JSON.stringify(dataM);

  const embed = new EmbedBuilder()
    .setTitle("Storage")
    .setDescription("```json\n" + jsonString + "\n```");

  await storageMessageM.edit({ embeds: [embed] }).catch(console.error);
  
}
const VSTORAGE_CHANNEL_ID = "1474153032139931720";
let storageMessageV = null;
let dataV = {};
export async function initViolationsStorage(client) {
  const channel = await client.channels.fetch(VSTORAGE_CHANNEL_ID).catch(() => null);
  if (!channel || !channel.isTextBased()) return;
  const messages = await channel.messages.fetch({ limit: 20 });
  storageMessageV = messages.find(
    m => m.author.id === client.user.id && m.embeds.length > 0
  );
  if (!storageMessageV) {
    dataV = { _init: true };
    const embed = new EmbedBuilder()
      .setTitle("Storage")
      .setDescription("```json\n" + JSON.stringify(dataV) + "\n```");
    storageMessageV = await channel.send({ embeds: [embed] });
  } else {
    try {
      const raw = storageMessageV.embeds[0].description
        .replace("```json\n", "")
        .replace("\n```", "");
      dataV = JSON.parse(raw);
    } catch {
      dataV = { _init: true };
    }
  }
}
export function getVData(key) {
  return dataV[key];
}
export async function setVData(key, value) {
  if (!storageMessageV) return;
  dataV[key] = value;
  const jsonString = JSON.stringify(data);
  const embed = new EmbedBuilder()
    .setTitle("Storage")
    .setDescription("```json\n" + jsonString + "\n```");
  await storageMessageV.edit({ embeds: [embed] }).catch(console.error);
}
const LOG_CHANNEL_ID = "1423413348220796991";

export function initAuditLogs(client) {

    const sendLog = async (title, user, text, color = "#ffffff", thumb = null, channelId = null) => {
        if (channelId === LOG_CHANNEL_ID) return;
        const chan = client.channels.cache.get(LOG_CHANNEL_ID);
        if (!chan) return;

        const embed = new EmbedBuilder()
            .setColor(color)
            .setAuthor({ 
                name: user?.tag || "System / Admin", 
                iconURL: user?.displayAvatarURL() || client.user.displayAvatarURL() 
            })
            .setDescription(`**Event:** \`${title}\`\n${text}`)
            .setFooter({ text: 'Kekse Clan Security | Master Log' })
            .setTimestamp();

        if (thumb) embed.setThumbnail(thumb);
        await chan.send({ embeds: [embed] }).catch(() => {});
    };

    client.on(Events.MessageDelete, async (msg) => {
        if (msg.partial || msg.author?.bot || msg.channel.id === LOG_CHANNEL_ID) return;
        const ghostPing = msg.mentions.users.size > 0 ? "⚠️ **GHOST PING ERKANNT**\n" : "";
        await sendLog("Nachricht gelöscht", msg.author, `${ghostPing}**Kanal:** ${msg.channel}\n**Inhalt:**\n\`\`\`${msg.content || "Kein Textinhalt"}\`\`\``, "#ffffff", null, msg.channel.id);
    });

    client.on(Events.MessageUpdate, async (oldMsg, newMsg) => {
        if (oldMsg.partial || oldMsg.content === newMsg.content || oldMsg.author?.bot || oldMsg.channel.id === LOG_CHANNEL_ID) return;
        await sendLog("Nachricht editiert", oldMsg.author, `**Kanal:** ${oldMsg.channel}\n**Vorher:**\n\`\`\`${oldMsg.content}\`\`\`\n**Nachher:**\n\`\`\`${newMsg.content}\`\`\``, "#ffffff", null, oldMsg.channel.id);
    });

    client.on(Events.GuildMemberAdd, async (member) => {
        await sendLog("User Join", member.user, `<@${member.id}> (${member.user.tag}) ist beigetreten.\nAccount erstellt: <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, "#ffffff", member.user.displayAvatarURL());
    });

    client.on(Events.GuildMemberRemove, async (member) => {
        await sendLog("User Leave", member.user, `<@${member.id}> (${member.user.tag}) ist gegangen oder wurde entfernt.`, "#f04747", member.user.displayAvatarURL());
    });

    client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
        if (oldMember.nickname !== newMember.nickname) {
            await sendLog("Nickname geändert", newMember.user, `Alt: \`${oldMember.nickname || "Kein"}\`\nNeu: \`${newMember.nickname || "Kein"}\``);
        }
        const addedRoles = newMember.roles.cache.filter(r => !oldMember.roles.cache.has(r.id));
        const removedRoles = oldMember.roles.cache.filter(r => !newMember.roles.cache.has(r.id));
        if (addedRoles.size > 0) await sendLog("Rolle vergeben", newMember.user, `Hinzugefügt: ${addedRoles.map(r => r.name).join(", ")}`, "#43b581");
        if (removedRoles.size > 0) await sendLog("Rolle entfernt", newMember.user, `Entfernt: ${removedRoles.map(r => r.name).join(", ")}`, "#f04747");
    });

    client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
        const user = newState.member.user;
        if (!oldState.channelId && newState.channelId) {
            await sendLog("VC Join", user, `Kanal: <#${newState.channelId}>`, "#ffffff");
        } else if (oldState.channelId && !newState.channelId) {
            await sendLog("VC Leave", user, `Kanal: <#${oldState.channelId}>`, "#ffffff");
        } else if (oldState.channelId !== newState.channelId) {
            await sendLog("VC Wechsel", user, `<#${oldState.channelId}> ➔ <#${newState.channelId}>`, "#ffffff");
        }
        if (!oldState.selfMute && newState.selfMute) {
            await sendLog("User gestummt (VC)", user, `In Kanal: <#${newState.channelId}>`);
        }
    });

    client.on(Events.GuildAuditLogEntryCreate, async (entry) => {
        const { action, executorId, targetId } = entry;
        const executor = await client.users.fetch(executorId).catch(() => null);

        if (action === AuditLogEvent.ChannelCreate) {
            await sendLog("Channel erstellt", executor, `ID: <#${targetId}>\nEin neuer Kanal wurde angelegt.`);
        }
        if (action === AuditLogEvent.ChannelDelete) {
            await sendLog("Channel gelöscht", executor, `ID: \`${targetId}\` (Kanal wurde entfernt)`, "#ffffff");
        }
        if (action === AuditLogEvent.ChannelUpdate) {
            await sendLog("Channel aktualisiert", executor, `Einstellungen in <#${targetId}> wurden geändert.`);
        }
        if (action === AuditLogEvent.ChannelOverwriteUpdate || action === AuditLogEvent.ChannelOverwriteCreate || action === AuditLogEvent.ChannelOverwriteDelete) {
            await sendLog("Channel Permissions aktualisiert", executor, `Berechtigungen in <#${targetId}> wurden modifiziert.`, "#ffffff");
        }

        if (action === AuditLogEvent.ThreadCreate) {
            await sendLog("Thread erstellt", executor, `Thread: <#${targetId}>`);
        }
        if (action === AuditLogEvent.ThreadDelete) {
            await sendLog("Thread gelöscht", executor, `Ein Thread wurde entfernt.`, "#ffffff");
        }
        if (action === AuditLogEvent.ThreadUpdate) {
            await sendLog("Thread aktualisiert", executor, `Thread <#${targetId}> wurde bearbeitet.`);
        }

        if (action === AuditLogEvent.RoleCreate) {
            await sendLog("Rolle erstellt", executor, `Eine neue Rolle wurde angelegt.`);
        }
        if (action === AuditLogEvent.RoleDelete) {
            await sendLog("Rolle gelöscht", executor, `ID: \`${targetId}\` (Rolle wurde entfernt)`, "#ffffff");
        }
        if (action === AuditLogEvent.RoleUpdate) {
            await sendLog("Rolle aktualisiert", executor, `Die Rolle <@&${targetId}> wurde bearbeitet.`);
        }

        if (action === AuditLogEvent.InviteCreate) {
            await sendLog("Invite erstellt", executor, `Ein neuer Einladungslink wurde generiert.`);
        }

        if (action === AuditLogEvent.GuildUpdate) {
            await sendLog("Server aktualisiert", executor, `Die allgemeinen Server-Einstellungen wurden geändert.`, "#ffffff");
        }

        if (action === AuditLogEvent.MemberBanAdd) await sendLog("BAN", executor, `Ziel: <@${targetId}>`, "#ffffff");
        if (action === AuditLogEvent.MemberBanRemove) await sendLog("UNBAN", executor, `Ziel: <@${targetId}>`, "#ffffff");
        if (action === AuditLogEvent.MemberKick) await sendLog("KICK", executor, `Ziel: <@${targetId}>`, "#ffffff");
    });

    client.on(Events.GuildInviteCreate, async (invite) => {
        await sendLog("Invite gesendet", invite.inviter, `Code: \`${invite.code}\`\nKanal: <#${invite.channelId}>`);
    });
}
const TEAM_ROLE_ID = "1457906448234319922";
export async function clear(client) {
  const sendKekseLog = async (action, user, details) => {
    const logChannel = client.channels.cache.get(LOG_CHANNEL_ID);
    if (!logChannel) return;
    const logEmbed = new EmbedBuilder()
      .setColor('#ffffff')
      .setAuthor({ 
          name: user.username, 
          iconURL: user.displayAvatarURL({ size: 512 }) 
      })
      .setDescription(`**Aktion:** \`${action}\`\n${details}`)
      .setFooter({ text: 'Kekse Clan | Moderation System' })
      .setTimestamp();
    await logChannel.send({ embeds: [logEmbed] }).catch(() => {});
  };
  client.on("messageCreate", async (message) => {
    if (!message.content.startsWith("!clear") || message.author.bot) return;
    if (!message.member.roles.cache.has(TEAM_ROLE_ID)) {
      await message.delete().catch(() => {});
      const warnMsg = await message.channel.send("❌ Keine Berechtigung!");
      return setTimeout(() => warnMsg.delete().catch(() => {}), 5000);
    }
    const args = message.content.split(/\s+/).slice(1);
    await message.delete().catch(() => {});
    const startTime = Date.now();
    let targetChannel = message.channel;
    let userIds = [];
    let amount = 100;
    let timeframe = null;
    if (/^\d{17,19}$/.test(args[0])) {
      const foundChannel = message.guild.channels.cache.get(args[0]);
      if (foundChannel?.isTextBased()) {
        targetChannel = foundChannel;
        args.shift();
      }
    }
    while (args.length && /^\d{17,19}$/.test(args[0])) {
      userIds.push(args.shift());
    }
    if (args.length) {
      if (/^\d+$/.test(args[0])) amount = Math.min(parseInt(args.shift()), 500);
      else timeframe = args.shift();
    }
    const statusMsg = await message.channel.send("🔍 Suche Nachrichten...");
    let messagesToDelete = [];
    let lastId = null;
    try {
      while (messagesToDelete.length < amount) {
        const fetched = await targetChannel.messages.fetch({ limit: 100, before: lastId });
        if (fetched.size === 0) break;
        for (const msg of fetched.values()) {
          if (userIds.length > 0 && !userIds.includes(msg.author.id)) continue;
          if (timeframe) {
            const ms = parseTimeframe(timeframe);
            if (Date.now() - msg.createdTimestamp > ms) continue;
          }
          messagesToDelete.push(msg);
          if (messagesToDelete.length >= amount) break;
        }
        lastId = fetched.last().id;
        if (fetched.size < 100) break;
      }
      if (messagesToDelete.length === 0) {
        return statusMsg.edit("❌ Keine Nachrichten gefunden, die den Kriterien entsprechen.").then(m => setTimeout(() => m.delete(), 5000));
      }
      let deletedCount = 0;
      const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
      const youngMsgs = messagesToDelete.filter(m => m.createdTimestamp > fourteenDaysAgo);
      const oldMsgs = messagesToDelete.filter(m => m.createdTimestamp <= fourteenDaysAgo);
      if (youngMsgs.length > 0) {
        await statusMsg.edit(`🚀 Bulk-Löschung von ${youngMsgs.length} Nachrichten...`);
        const deletedBulk = await targetChannel.bulkDelete(youngMsgs, true);
        deletedCount += deletedBulk.size;
      }
      if (oldMsgs.length > 0) {
        for (let i = 0; i < oldMsgs.length; i++) {
          await oldMsgs[i].delete().catch(() => {});
          deletedCount++;
          if (deletedCount % 5 === 0) await statusMsg.edit(`⏳ Lösche alte Nachrichten: **${deletedCount}/${messagesToDelete.length}**...`);
          await new Promise(r => setTimeout(r, 1200)); 
        }
      }
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      await statusMsg.delete().catch(() => {});
      const finishMsg = await message.channel.send(
        `✅ **Abschlussbericht:**\n- Gelöscht: **${deletedCount}**\n- Dauer: **${duration}s**\n- Kanal: <#${targetChannel.id}>`
      );
      const userList = userIds.length > 0 ? userIds.map(id => `<@${id}>`).join(", ") : "Alle User";
      await sendKekseLog("Nachrichten gelöscht (Clear)", message.author, 
        `**Kanal:** <#${targetChannel.id}>\n` +
        `**Anzahl:** ${deletedCount}\n` +
        `**Filter (User):** ${userList}\n` +
        `**Zeitrahmen:** ${timeframe || "Keiner"}\n` +
        `**Dauer:** ${duration}s`
      );
      setTimeout(() => finishMsg.delete().catch(() => {}), 15000);
    } catch (err) {
      console.error(err);
      if (statusMsg) await statusMsg.edit("❌ Fehler beim Löschen (Berechtigungen prüfen).").catch(() => {});
    }
  });
}
function parseTimeframe(tf) {
  const match = tf.match(/^(\d+)([smhd])$/);
  if (!match) return 0;
  const num = parseInt(match[1]);
  switch (match[2]) {
    case "s": return num * 1000;
    case "m": return num * 60000;
    case "h": return num * 3600000;
    case "d": return num * 86400000;
    default: return 0;
  }
}
export const ruleMap = {
  "§1a1n1": { section: "Respekt und Freundlichkeit", text: "Sei respektvoll. Beleidigungen, Diskriminierung, Mobbing oder Drohungen werden nicht toleriert." },
  "§1a1n2": { section: "Respekt und Freundlichkeit", text: "Diskutiere sachlich und vermeide provokative Streitigkeiten." },
  "§1a2n1": { section: "Keine unangemessenen Inhalte", text: "Keine anstößigen, pornografischen, rassistischen oder gewalttätigen Inhalte posten." },
  "§1a2n2": { section: "Keine unangemessenen Inhalte", text: "Illegale Inhalte oder Diskussionen über illegale Aktivitäten sind verboten." },
  "§1a3n1": { section: "Spam, Werbung und Links", text: "Spam jeglicher Art ist nicht erlaubt." },
  "§1a3n2": { section: "Spam, Werbung und Links", text: "Werbung oder Links nur in genehmigten Kanälen mit Zustimmung der Moderatoren." },
  "§2a1n1": { section: "Datenschutz", text: "Keine persönlichen Informationen ohne Erlaubnis teilen. Respektiere die Privatsphäre anderer Mitglieder." },
  "§2a2n1": { section: "Keine unerwünschte Kontaktaufnahme", text: "Keine unaufgeforderten Direktnachrichten, insbesondere Werbung oder Anfragen." },
  "§2a2n2": { section: "Keine unerwünschte Kontaktaufnahme", text: "Wünsche nach Ruhe respektieren." },
  "§3a1n1": { section: "Richtige Kanäle", text: "Poste nur im passenden Kanal." },
  "§3a1n2": { section: "Richtige Kanäle", text: "Nutze die richtigen Kanäle für Fragen, Diskussionen oder Medien." },
  "§3a1n3": { section: "Richtige Kanäle", text: "Bots dürfen nur in den dafür vorgesehenen Channels verwendet werden." },
  "§3a2n1": { section: "Sprache und Ausdruck", text: "Freundlich und konstruktiv kommunizieren. Fluchen nur in Maßen." },
  "§3a2n2": { section: "Sprache und Ausdruck", text: "Server-Sprache: Deutsch." },
  "§3a3n1": { section: "Voice Chats", text: "Störgeräusche vermeiden." },
  "§3a3n2": { section: "Voice Chats", text: "Dauerhaftes Stummschalten oder wiederholtes Verlassen und Betreten ist nicht erlaubt." },
  "§4a1n1": { section: "Tickets", text: "Missbrauch von Tickets, z. B. ohne Grund öffnen, wird bestraft." },
  "§5a1n1": { section: "Giveaways", text: "Tickets für Giveaways müssen innerhalb von 2 Tagen nach Ende geöffnet werden, sonst erfolgt ein Reroll." },
  "§5a1n2": { section: "Giveaways", text: "Mitglieder, die aktuell gebannt sind, dürfen nicht am Giveaway teilnehmen." },
  "§6a1n1": { section: "Verhalten gegenüber Moderatoren", text: "Entscheidungen der Moderatoren respektieren. Probleme über ein Ticket klären." },
  "§6a1n2": { section: "Verhalten gegenüber Moderatoren", text: "Den Anweisungen der Moderatoren Folge leisten." },
  "-ssa-": { section: "Mögliche Gefahr durch Spamming.", text: "Der User wurde von Discord mit 'Engaged in suspected spam activity' gekennzeichnet und wird aufgrund der ausgehenden Gefahr vom Discord Server ausgeschlossen."}
};

export async function sendPunishmentInfo(user, type, reason, duration = null) {
  let ruleText = "";
  let sectionTitle = "";
  
  const ruleMatch = reason ? reason.match(/§\d+a\d+n\d+|-ssa-/) : null;
  if (ruleMatch) {
    const code = ruleMatch[0];
    const ruleInfo = ruleMap[code];
    if (ruleInfo) {
      sectionTitle = ruleInfo.section;
      ruleText = `\n\nRegelauszug (${code}):\n[...] "${ruleInfo.text}" [...]`;
    }
  }

  const durationText = duration ? `\n\nDauer: ${duration}` : "";
  const typeLabels = {
    "ban": "Bann",
    "kick": "Kick",
    "timeout": "Timeout"
  };
  const label = typeLabels[type] || type;
  
  const message = `Hey ${user.username},

dein Account auf \`Kekse Clan\` hat eine Strafe erhalten: **${label}**.

Grund: ${reason}${sectionTitle ? ` (${sectionTitle})` : ""}${durationText}${ruleText}

Um sicherzustellen, dass unsere Community sicher und freundlich bleibt, befolge bitte unsere Regeln. Die vollständigen Regeln findest du hier: https://discord.com/channels/1423413347168157718/1423413348065611949`;

  await user.send(message).catch(() => console.log(`Konnte DM an ${user.tag} nicht senden.`));
}
export async function initInvites(client) {
  const inviteCache = new Map();
  const TEAM_ROLE_ID = "1457906448234319922";
  const cacheInvites = async () => {
    for (const g of client.guilds.cache.values()) {
      const invs = await g.invites.fetch().catch(() => null);
      if (invs) inviteCache.set(g.id, new Map(invs.map(i => [i.code, i.uses])));
    }
  };
  client.on("ready", cacheInvites);
  client.on("messageCreate", async (msg) => {
    if (msg.author.bot || !msg.content.startsWith("!")) return;
    const args = msg.content.slice(1).split(/\s+/);
    const cmd = args.shift().toLowerCase();
    if (cmd === "invite_leaderboard" || cmd === "invites") {
      const stats = getIData("invite_stats") || {};
      const leaderboard = Object.entries(stats).map(([id, s]) => ({ id, ...s, total: (s.regular || 0) - (s.left || 0) - (s.fake || 0) + (s.bonus || 0) })).sort((a, b) => b.total - a.total).slice(0, 10);
      if (leaderboard.length === 0) return msg.reply("Keine Daten.");
      let desc = "";
      leaderboard.forEach((e, i) => { desc += `\`${i + 1}. \` <@${e.id}> • **${e.total}** invites. (${e.regular} regular, ${e.left} left, ${e.fake} fake, ${e.bonus} bonus)\n`; });
      const embed = new EmbedBuilder().setTitle("<:statistiques:1467246038497886311> Invite Leaderboard").setDescription(desc).setColor(0xffffff);
      await msg.reply({ embeds: [embed] });
    }
    if (cmd === "addbonus" && msg.member.roles.cache.has(TEAM_ROLE_ID)) {
      const target = msg.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);
      const amount = parseInt(args[1]);
      if (!target || isNaN(amount)) return msg.reply("❌ !addbonus @user 10");
      const stats = getData("invite_stats") || {};
      stats[target.id] = stats[target.id] || { regular: 0, left: 0, fake: 0, bonus: 0 };
      stats[target.id].bonus = (stats[target.id].bonus || 0) + amount;
      await setIData("invite_stats", stats);
      msg.reply(`✅ +${amount} für ${target.username}`);
    }
  });
  client.on("guildMemberAdd", async (m) => {
    const cached = inviteCache.get(m.guild.id);
    const current = await m.guild.invites.fetch().catch(() => null);
    if (!current || !cached) return;
    const used = current.find(i => i.uses > (cached.get(i.code) || 0));
    inviteCache.set(m.guild.id, new Map(current.map(i => [i.code, i.uses])));
    if (used) {
      const stats = getIData("invite_stats") || {};
      const rels = getIData("invite_relations") || {};
      const inviterId = used.inviter.id;
      stats[inviterId] = stats[inviterId] || { regular: 0, left: 0, fake: 0, bonus: 0 };
      rels[m.id] = inviterId;
      const isFake = (Date.now() - m.user.createdTimestamp) < 86400000;
      isFake ? stats[inviterId].fake++ : stats[inviterId].regular++;
      await setIData("invite_stats", stats);
      await setIData("invite_relations", rels);
    }
  });
  client.on("guildMemberRemove", async (m) => {
    const rels = getIData("invite_relations") || {};
    const inviterId = rels[m.id];
    if (inviterId) {
      const stats = getIData("invite_stats") || {};
      if (stats[inviterId]) { stats[inviterId].left++; await setIData("invite_stats", stats); }
      delete rels[m.id];
      await setIData("invite_relations", rels);
    }
  });
}
export function initModSend(client) {
  client.on("guildAuditLogEntryCreate", async (entry, guild) => {
    const { action, targetId, reason, executorId } = entry;
    if (executorId === client.user.id) return; 
    let type = "";
    let duration = null;
    if (action === AuditLogEvent.MemberBanAdd) type = "ban";
    else if (action === AuditLogEvent.MemberKick) type = "kick";
    else if (action === AuditLogEvent.MemberUpdate) {
      const timeoutChange = entry.changes.find(c => c.key === "communication_disabled_until");
      if (timeoutChange && timeoutChange.new) {
        type = "timeout";
        duration = "Check Audit Log";
      }
    }

    if (type) {
      const target = await client.users.fetch(targetId).catch(() => null);
      if (target) {
        if (type === "timeout") {
          const timeoutChange = entry.changes.find(c => c.key === "communication_disabled_until");
          if (timeoutChange && timeoutChange.new) {
            const until = new Date(timeoutChange.new);
            const now = new Date();
            const diffMs = until - now;
            const diffMin = Math.round(diffMs / 60000);
            
            if (diffMin >= 60 * 24) {
              duration = `${Math.round(diffMin / (60 * 24))} Tag(e)`;
            } else if (diffMin >= 60) {
              duration = `${Math.round(diffMin / 60)} Stunde(n)`;
            } else {
              duration = `${diffMin} Minute(n)`;
            }
          }
        }
        await sendPunishmentInfo(target, type, reason || "Kein Grund angegeben.", duration);
      }
    }
  });
}
function hasPerm(member) {
  return member.permissions.has(PermissionsBitField.Flags.ModerateMembers);
}

export function initModeration(client) {
  client.on("messageCreate", async msg => {
    if (msg.author.bot || !msg.content.startsWith("!")) return;
    if (!msg.member.roles.cache.has(TEAM_ROLE_ID) || !hasPerm(msg.member)) return;

    const args = msg.content.slice(1).split(/\s+/);
    const cmd = args.shift().toLowerCase();
    let data = getMData("moderation") || { warns: {} };

    const getUser = async (input) => {
      if (!input) return null;
      const id = input.replace(/[<@!>]/g, "");
      if (/^\d{17,20}$/.test(id)) return await client.users.fetch(id).catch(() => null);
      return null;
    };

    const sendModLog = async (action, target, reason, extra = null) => {
      const logChannel = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
      if (!logChannel) return;

      const kekseEmbed = new EmbedBuilder()
        .setColor('#ffffff')
        .setAuthor({ 
            name: msg.author.username, 
            iconURL: msg.author.displayAvatarURL({ size: 512 }) 
        })
        .setTitle(`🛠️ Mod-Aktion: ${action}`)
        .setDescription(`**Target:** ${target.tag || target.id} (\`${target.id}\`)\n**Grund:** ${reason}${extra ? `\n**Info:** ${extra}` : ""}`)
        .setFooter({ text: 'Kekse Clan | Moderation Logs' })
        .setTimestamp();

      await logChannel.send({ embeds: [kekseEmbed] }).catch(() => {});
    };

    if (cmd === "timeout") {
      const user = await getUser(args[0]);
      const durationStr = args[1];
      const reason = args.slice(2).join(" ") || "Kein Grund";
      if (!user || !durationStr) return msg.reply({ content: "❌ Syntax: `!timeout @user 10m Grund`.", ephemeral: true });

      const match = durationStr.match(/^(\d+)([smhd])$/);
      if (!match) return msg.reply({ content: "❌ Format: 10s, 5m, 2h, 1d", ephemeral: true });
      const durationMs = parseDuration(match[1], match[2]);

      try {
        const member = await msg.guild.members.fetch(user.id);
        await member.timeout(durationMs, reason);
        await sendModLog("Timeout", user, reason, `Dauer: ${durationStr}`);
        await msg.reply({ content: `✅ **Timeout**: <@${user.id}> für ${durationStr}.`, ephemeral: true });
      } catch (err) { 
        await msg.reply({ content: "❌ Fehler: User nicht auf Server oder fehlende Rechte.", ephemeral: true }); 
      }
    }

    if (cmd === "untimeout") {
      const user = await getUser(args[0]);
      const reason = args.slice(1).join(" ") || "Kein Grund";
      if (!user) return msg.reply({ content: "❌ User nicht gefunden.", ephemeral: true });

      try {
        const member = await msg.guild.members.fetch(user.id);
        await member.timeout(null, reason);
        await sendModLog("Untimeout", user, reason);
        await msg.reply({ content: `✅ **Untimeout**: <@${user.id}>`, ephemeral: true });
      } catch (err) { 
        await msg.reply({ content: "❌ Fehler beim Untimeout.", ephemeral: true }); 
      }
    }

    if (cmd === "kick") {
      const user = await getUser(args[0]);
      const reason = args.slice(1).join(" ") || "Kein Grund";
      if (!user) return msg.reply({ content: "❌ User nicht gefunden.", ephemeral: true });

      try {
        await msg.guild.members.kick(user.id, reason);
        await sendModLog("Kick", user, reason);
        await msg.reply({ content: `✅ **Kick**: <@${user.id}>`, ephemeral: true });
      } catch (err) { 
        await msg.reply({ content: "❌ Fehler beim Kick.", ephemeral: true }); 
      }
    }

    if (cmd === "ban") {
      const idInput = args[0]?.replace(/[<@!>]/g, "");
      const reason = args.slice(1).join(" ") || "Kein Grund";
      if (!idInput || !/^\d{17,20}$/.test(idInput)) return msg.reply({ content: "❌ Gültige ID/Erwähnung angeben.", ephemeral: true });

      try {
        const user = await client.users.fetch(idInput).catch(() => ({ id: idInput, tag: "Unknown#0000" }));
        await msg.guild.members.ban(idInput, { reason });
        await sendModLog("Ban", user, reason);
        await msg.reply({ content: `✅ **Ban**: ${user.tag || idInput} wurde gebannt.`, ephemeral: true });
      } catch (err) { 
        await msg.reply({ content: "❌ Fehler beim Ban (Rechte?).", ephemeral: true }); 
      }
    }

    if (cmd === "unban") {
      const idInput = args[0]?.replace(/[<@!>]/g, "");
      const reason = args.slice(1).join(" ") || "Kein Grund";
      if (!idInput) return msg.reply({ content: "❌ ID angeben.", ephemeral: true });

      try {
        const user = await client.users.fetch(idInput).catch(() => ({ id: idInput, tag: idInput }));
        await msg.guild.members.unban(idInput, reason);
        await sendModLog("Unban", user, reason);
        await msg.reply({ content: `✅ **Unban**: ${user.tag || idInput}`, ephemeral: true });
      } catch (err) { 
        await msg.reply({ content: "❌ User nicht gebannt oder ID falsch.", ephemeral: true }); 
      }
    }

    if (cmd === "warn") {
      const user = await getUser(args[0]);
      const reason = args.slice(1).join(" ") || "Kein Grund";
      if (!user) return msg.reply({ content: "❌ User nicht gefunden.", ephemeral: true });

      data.warns[user.id] ??= [];
      data.warns[user.id].push({ reason, by: msg.author.id, date: Date.now() });
      await setMData("moderation", data);
      
      await sendModLog("Warnung", user, reason, `Warn-Stand: ${data.warns[user.id].length}`);
      await msg.reply({ content: `⚠️ **Warn**: <@${user.id}> (Gesamt: ${data.warns[user.id].length})`, ephemeral: true });
    }

    if (cmd === "warns") {
      const user = await getUser(args[0]);
      if (!user) return msg.reply({ content: "❌ User nicht gefunden.", ephemeral: true });
      const userWarns = data.warns[user.id] || [];
      if (userWarns.length === 0) return msg.reply({ content: "✅ Keine Warnungen.", ephemeral: true });

      const embed = new EmbedBuilder()
        .setTitle(`Warnungen: ${user.username}`)
        .setColor('#ffffff')
        .setDescription(userWarns.map((w, i) => `**${i + 1}.** ${w.reason} (von <@${w.by}>)`).join("\n"))
        .setFooter({ text: 'Kekse Clan' });
      await msg.reply({ embeds: [embed] });
    }

    if (cmd === "warn_remove") {
      const user = await getUser(args[0]);
      const index = parseInt(args[1]) - 1;
      if (!user || isNaN(index) || !data.warns[user.id]?.[index]) return msg.reply({ content: "❌ Ungültiger Index.", ephemeral: true });

      const removed = data.warns[user.id].splice(index, 1);
      await setMData("moderation", data);
      await sendModLog("Warn entfernt", user, `Grund war: ${removed[0].reason}`);
      await msg.reply({ content: "✅ Warnung entfernt.", ephemeral: true });
    }
  });
}

function parseDuration(amount, unit) {
  const map = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return parseInt(amount) * map[unit];
}
const VERIFY_CHANNEL_ID = "1439337595090898955";
const UNVERIFIED_ROLE_ID = "1439337577508245837";
export function initVerification(client) {
  const sendKekseLog = async (action, user, details) => {
    const logChannel = client.channels.cache.get(LOG_CHANNEL_ID);
    if (!logChannel) return;
    const logEmbed = new EmbedBuilder()
      .setColor('#ffffff')
      .setAuthor({ 
          name: user.username, 
          iconURL: user.displayAvatarURL({ size: 512 }) 
      })
      .setDescription(`**Aktion:** \`${action}\`\n${details}`)
      .setFooter({ text: 'Kekse Clan | Verification System' })
      .setTimestamp();
    await logChannel.send({ embeds: [logEmbed] }).catch(() => {});
  };
  client.on("guildMemberAdd", async (member) => {
    await member.roles.add(UNVERIFIED_ROLE_ID).catch(() => {});
  });
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton() || interaction.customId !== "verify_user") return;   
    const member = interaction.member;
    if (!member.roles.cache.has(UNVERIFIED_ROLE_ID)) {
      return interaction.reply({ 
        content: "Du bist bereits verifiziert.", 
        ephemeral: true 
      });
    }
    try {
      await member.roles.remove(UNVERIFIED_ROLE_ID);
      await sendKekseLog("User Verifiziert", interaction.user, `Der User hat den Button genutzt und die Rolle <@&${UNVERIFIED_ROLE_ID}> wurde entfernt.`);
      
      await interaction.reply({ 
        content: "Erfolgreich verifiziert!", 
        ephemeral: true 
      });
    } catch (err) {
      await interaction.reply({ 
        content: "Fehler: Meine Rolle steht in der Liste vermutlich unter der Verifizierungs-Rolle.", 
        ephemeral: true 
      });
    }
  });

  client.on("messageCreate", async (msg) => {
    if (msg.content === "!setup_verify") {
      if (!msg.member.roles.cache.has(TEAM_ROLE_ID)) return;
      
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("verify_user")
          .setLabel("Verifizieren")
          .setStyle(ButtonStyle.Success)
      );
      const channel = client.channels.cache.get(VERIFY_CHANNEL_ID);
      if (channel) {
        const imageUrl = new AttachmentBuilder('./Kekse Clan Bot/verify.png');
        
        await channel.send({ 
          content: "**Willkommen!** Klicke auf den Button, um die Verifizierung abzuschließen.",
          files: [imageUrl],
          components: [row] 
        });

        await sendKekseLog("Verification Setup", msg.author, `Das Verifizierungs-Panel wurde in <#${VERIFY_CHANNEL_ID}> neu aufgesetzt.`);
        
        await msg.delete().catch(() => {});
      }
    }
  });
}
const PING_ID = "1151971830983311441";
const LEVELS = [
  { count: 5,  duration: 1 * 86400000, label: "1 Tag" },
  { count: 10, duration: 2 * 86400000, label: "2 Tage" },
  { count: 25, duration: 7 * 86400000, label: "7 Tage" },
  { count: 50, duration: 31 * 86400000, label: "31 Tage" }
];
export async function violations(client) {
  const sendKekseLog = async (action, user, details, color = "#ffffff") => {
    const logChannel = client.channels.cache.get(LOG_CHANNEL_ID);
    if (!logChannel) return;
    const logEmbed = new EmbedBuilder()
      .setColor(color)
      .setAuthor({ 
          name: user.username, 
          iconURL: user.displayAvatarURL({ size: 512 }) 
      })
      .setDescription(`**Aktion:** \`${action}\`\n${details}`)
      .setFooter({ text: 'Kekse Clan | Automated Security' })
      .setTimestamp();
    await logChannel.send({ embeds: [logEmbed] }).catch(() => {});
  };
  client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild) return;
    const data = getVData("violations");
    if (!data) return;
    const entry = data[message.author.id];
    if (!entry) return;
    if (!entry.appliedLevel) entry.appliedLevel = 0;
    const level = LEVELS.find(l => entry.count >= l.count && entry.appliedLevel < l.count);
    if (!level) return;
    const member = await message.guild.members.fetch(message.author.id).catch(() => null);
    if (!member) return;
    try {
      await member.timeout(level.duration, "Automatisches System: Verstoß-Schwelle erreicht (§2a1n1)");
      entry.appliedLevel = level.count;
      await setVData("violations", data);
      await sendKekseLog(
        "Automatischer Timeout", 
        message.author, 
        `**Grund:** Verstoß-Schwelle erreicht (${level.count} Verstöße)\n` +
        `**Dauer:** ${level.label}\n` +
        `**Status:** System-Sanktion ausgeführt.`
      );
    } catch (err) {
      if (entry.adminNotified) return;

      const logChannel = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
      if (logChannel) {
        const alertEmbed = new EmbedBuilder()
          .setColor("#ff0000")
          .setTitle("⚠️ Sanktion Fehlgeschlagen")
          .setDescription(
            `<@${PING_ID}>, die automatische Sanktion für <@${member.id}> (${member.user.tag}) schlug fehl.\n\n` +
            `**Grund:** Wahrscheinlich Administrator-Rechte oder Rollen-Hierarchie.\n` +
            `**Erreichte Schwelle:** ${level.count} Verstöße.`
          )
          .setTimestamp();
        await logChannel.send({ content: `<@${PING_ID}>`, embeds: [alertEmbed] });
      }
      entry.adminNotified = true;
      await setVData("violations", data);
    }
  });
}
client.once("ready", async () => {
    await initInvitesStorage(client);
    await initModerationStorage(client); 
    await initViolationsStorage(client);
    initModeration(client);
    initVerification(client);
    initInvites(client); 
    initAuditLogs(client);
    clear(client);
    warning(client);
    initModSend(client);
    violations(client);
})
client.setMaxListeners(20);
client.on("error", console.error)
client.on("warn", console.warn)
client.login(process.env.BOT_TOKEN)
