import { kickChannel, subBadges } from "./ws.js";
import { sevenTVEmotes } from "./7tv.js";
import { fadeURL } from "./settings.js";
import { fadeTimeURL } from "./settings.js";

let finalMessage;
let messageCount;

const excludedKickBots = [
  "babblechat",
  "botrix",
  "casterlabs",
  "intrx",
  "livebot",
  "lottobot",
  "logibot",
  "mrbeefbot",
  "notibot",
  "squadbot",
  "babzbot",
  "kickbot"
];

const kickFirstClass = [
  "adiofreak",
  "averagedad",
  "beezybee",
  "beckatv",
  "blinktattoo",
  "brianmendoza",
  "chopstix",
  "crazytawn",
  "essie_gotback_kick",
  "extremelykole",
  "grym",
  "igypc",
  "inthemudsports",
  "jeremyworst",
  "kennyhoopz",
  "kingwoolz",
  "laurenshayla",
  "lindsywood",
  "loochy",
  "majin",
  "msgolightly",
  "partylikeamotha",
  "ryda",
  "sgt_jackson12",
  "testy",
  "theleaway",
  "thonggdelonge",
  "uhmaayyze",
  "wittlebears",
  "wymzi",
  "wswoodcarving",
  "yuppy"
];

const kickSecondClass = [
  "12amcupid",
  "auroraphoenyx",
  "boneclinks",
  "breeazyy",
  "brittanycorp",
  "cuvey",
  "daltwizney",
  "divatopia",
  "fugglet",
  "ggravees",
  "geitta",
  "crowegamingg",
  "heelkd",
  "heyimnatalia",
  "jaredfps",
  "jessie",
  "jesusdelbarrio",
  "jokerguk",
  "kenny",
  "laparce",
  "lindsayelyse",
  "lornexia",
  "machitv",
  "mattlafff",
  "moosey",
  "mssavageaf",
  "natchats",
  "oakleyboiii",
  "ogl",
  "overgirl",
  "pandaskills",
  "pinksakura",
  "regimentgg",
  "rivalxfactor",
  "rolex",
  "sabrinasoloshow",
  "schlump",
  "scubaryan",
  "siefe",
  "sirgime",
  "sixwheels",
  "soltek",
  "stefisaurusflex",
  "steffyevans",
  "stormbreaker",
  "thelostdrake",
  "tonzy",
  "urban",
  "zombiebarricades"
];

const kickThirdClass = [
  "alyb0ba",
  "bree",
  "conman167",
  "conman167",
  "controldec",
  "daddieslittlenox",
  "drewissharing",
  "dubzmusic",
  "dwolf",
  "eyesha",
  "fack7up",
  "forrestdump",
  "glitchy",
  "gogirl",
  "hellsdevil",
  "j9streams",
  "jamesbraygang",
  "jenna",
  "jess",
  "jkucci",
  "jpgnotfound",
  "kayladelancey",
  "kkryptix",
  "kooterbomb",
  "kraftykaylub",
  "kurect",
  "las_",
  "liaam",
  "lolabunz",
  "loulz",
  "mclovins",
  "mercoffdaperc",
  "miithyx",
  "na5ty",
  "neomotoko",
  "nojugsjenna",
  "novacourt",
  "punch",
  "razo97",
  "rellik",
  "sepholey",
  "sereda",
  "shortypie",
  "simbathagod",
  "stract",
  "Stroud",
  "viktoreeous",
  "xitzmisslegitx",
  "yogiibutt",
  "zee"
];

const emoteRegex = /\[(emote|emoji):(\w+):?[^\]]*\]/g;
const htmlRegex = /(?<!src=")https?:\/\/[^\s]+(?![^<]*<\/img>)/g;

// set DOM elements
const chatEL = document.getElementById("chat");
const kickIconCheck = document.getElementById("kickIconCheck");
const timeStampCheck = document.getElementById("timeStampCheck");

function createMessage(
  messageID,
  messageContent,
  messageUsername,
  senderColor,
  messageUserID,
  senderBadges,
  subscriberAge
) {
  // replace kick emote/emoji tags with their corresponding images
  const messageWithEmotes = messageContent.replace(
    emoteRegex,
    (match, type, id) => {
      const imageSrc =
        type === "emote"
          ? `https://files.kick.com/emotes/${id}/fullsize`
          : `https://dbxmjjzl5pc1g.cloudfront.net/9576c763-3777-4a57-8a8f-38cdb79de660/images/emojis/${id}.png`;
      const emoteName = match.substring(
        match.lastIndexOf(":") + 1,
        match.length - 1
      );
      return `<img src="${imageSrc}" title="${emoteName}" alt="${match}" />`;
    }
  );
  const messageWithLinks = messageWithEmotes.replace(
    htmlRegex,
    '<span class="chatLink">$&</span>'
  );

  // Initialize the final message with the original message
  finalMessage = messageWithLinks;
  console.log(finalMessage);

  // Iterate over each emote in sevenTVEmotes
  sevenTVEmotes.forEach((emote) => {
    const sevenTVEmoteName = emote.name;
    const sevenTVEmoteUrl = emote.url;

    const sanitizedEmoteName = escapeRegExp(sevenTVEmoteName);
    const sevenTVRegex = new RegExp(
      `(?<!<img[^>]*="[^"]*)\\b${sanitizedEmoteName}\\b(?!")`,
      "g"
    );

    // Replace the emote name with the image URL in the message
    finalMessage = finalMessage.replace(
      sevenTVRegex,
      `<img src="${sevenTVEmoteUrl}" alt="${sevenTVEmoteName}">`
    );
  });

  // create message element
  const messageElement = document.createElement("div");
  messageElement.setAttribute("data-platform", "kick");
  messageElement.id = messageID;
  messageElement.setAttribute("user-id", messageUserID);

  // Convert both bot names and messageUsername to lowercase for case-insensitive comparison
  const lowercaseExcludedKickBots = excludedKickBots.map((botName) =>
    botName.toLowerCase()
  );
  const lowercaseMessageUsername = messageUsername.toLowerCase();

  // Check if messageUsername is in the excludedTwitchBots array
  if (lowercaseExcludedKickBots.includes(lowercaseMessageUsername)) {
    messageElement.classList.add("message-item", "bot");
  } else {
    messageElement.classList.add("message-item");
  }

  // create span elements for timestamp, badges, username, and message
  const timestampSpan = document.createElement("span");
  const badgesSpan = document.createElement("span");
  const usernameSpan = document.createElement("span");
  const messageSpan = document.createElement("span");

  // set the classes for the span elements
  timestampSpan.classList.add("timestamp");
  usernameSpan.classList.add("username", "kick");
  messageSpan.classList.add("message");
  badgesSpan.classList.add("badges");
  badgesSpan.setAttribute("data-platform", "kick"); // Add data attribute with value "kick"

  // check if message is directed to channel owner and apply style
  if (
    messageWithEmotes
      .toLowerCase()
      .includes(`@${kickChannel.toString().toLowerCase()}`)
  ) {
    messageSpan.classList.add("atYouKick");
    messageElement.classList.add("atYou");
  }

  // Add Kick logo to the badges span
  const kickLogo = document.createElement("img");
  kickLogo.id = "platform-badge";
  kickLogo.classList.add("logo-kick");
  kickLogo.src = "assets/logo-kick.png";
  kickLogo.alt = "Kick Logo";
  badgesSpan.appendChild(kickLogo);

  // set the text content for the span elements
  const timestamp = new Date();
  const hours = timestamp.getHours();
  const minutes = timestamp.getMinutes();
  const formattedHours = (hours % 12 || 12).toString().padStart(2, "0");
  const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
  timestampSpan.textContent = formattedHours + ":" + formattedMinutes;
  usernameSpan.textContent = messageUsername;
  usernameSpan.style.color = senderColor;
  messageSpan.innerHTML = finalMessage;

  // Create badge elements and add them to badgesSpan
  if (senderBadges.length > 0) {
    for (let badgeType of senderBadges) {
      const badgeImg = document.createElement("img");

      if (badgeType === "subscriber") {
        let closestBadge = null;
        for (let badge of subBadges) {
          if (badge.months <= subscriberAge) {
            closestBadge = badge;
          } else {
            break;
          }
        }
        if (closestBadge) {
          badgeImg.src = closestBadge.badge_image.src;
        } else if (subBadges.length === 0) {
          badgeImg.src = "assets/subscriber.svg"; // Use default subscriber.svg image if the stream has no sub badges
        }
        badgeImg.classList.add("user-badges");
        badgeImg.setAttribute("title", subscriberAge + " month subscriber");
      } else {
        badgeImg.src = `assets/${badgeType}.svg`;
        badgeImg.classList.add("user-badges");
        badgeImg.setAttribute("title", badgeType);
      }
      badgeImg.alt = badgeType;

      // Add the badgeImg to the badgeSpan
      badgesSpan.appendChild(badgeImg);
    }
  }

  // add kick first class badge
  // Check if lowercaseMessageUsername is in lowercaseKickFirstClass
  if (kickFirstClass.includes(lowercaseMessageUsername)) {
    // Add First Class badge to the badges span
    const firstClassBadge = document.createElement("img");
    firstClassBadge.classList.add("user-badges");
    firstClassBadge.src = "assets/firstclass.png";
    firstClassBadge.setAttribute("title", "Kick First Class");
    firstClassBadge.alt = "Kick First Class";
    badgesSpan.appendChild(firstClassBadge);
  }

  // add kick second class badge
  if (kickSecondClass.includes(lowercaseMessageUsername)) {
    // Add First Class badge to the badges span
    const secondClassBadge = document.createElement("img");
    secondClassBadge.classList.add("user-badges");
    secondClassBadge.src = "assets/secondclass.png";
    secondClassBadge.setAttribute("title", "Kick Second Class");
    secondClassBadge.alt = "Kick Second Class";
    badgesSpan.appendChild(secondClassBadge);
  }

  if (kickThirdClass.includes(lowercaseMessageUsername)) {
    // Add First Class badge to the badges span
    const thirdClassBadge = document.createElement("img");
    thirdClassBadge.classList.add("user-badges");
    thirdClassBadge.src = "assets/thirdclass.png";
    thirdClassBadge.setAttribute("title", "Kick Second Class");
    thirdClassBadge.alt = "Kick Second Class";
    badgesSpan.appendChild(thirdClassBadge);
  }

  // append the span elements to the message element
  messageElement.appendChild(timestampSpan);
  messageElement.appendChild(badgesSpan);
  messageElement.appendChild(usernameSpan);
  messageElement.appendChild(messageSpan);

  return messageElement;
}

export function prependMessage(
  messageID,
  messageContent,
  messageUsername,
  senderColor,
  messageUserID,
  senderBadges,
  subscriberAge
) {
  // Create a new message element
  const newMessage = createMessage(
    messageID,
    messageContent,
    messageUsername,
    senderColor,
    messageUserID,
    senderBadges,
    subscriberAge
  );

  // Append the new message element to the chat element
  chatEL.appendChild(newMessage);

  // Schedule the removal of the message after a specified duration
  setTimeout(() => {
    fadeRemoveMessage(messageID);
  }, fadeTimeURL); // Duration in milliseconds (30 seconds in this example)
}

// Remove excess messages beyond the limit
export function removeExcessMessages(limit) {
  messageCount = chatEL.children.length;

  while (messageCount > limit) {
    chatEL.firstChild.remove(); // Remove the last child element
    messageCount--; // Update the message count
  }
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // Escape special characters
}

// Function to fade to remove messages but check if the option is enabled or not
export function fadeRemoveMessage(messageID) {
  if (fadeURL === "on") {
    const messageElement = document.getElementById(messageID);
    messageElement.style.opacity = 0;

    setTimeout(() => {
      messageElement.remove();
      removeExcessMessages(100);
    }, fadeTimeURL);
  } else if (fadeURL === "off") {
    removeExcessMessages(100);
  }
}

export function removeChatMessage(id) {
  const messageEL = document.getElementById(id);

  if (chatEL && messageEL) {
    chatEL.removeChild(messageEL);
    console.log(`Message with ID ${id} has been removed.`);
  } else {
    console.log(`Message with ID ${id} not found.`);
  }
}

