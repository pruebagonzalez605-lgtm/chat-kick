import { prependMessage,
  removeChatMessage } from "./app.js";
import { fetch7TVEmotes } from "./7tv.js";

const urlParams = new URLSearchParams(window.location.search);
export const kickChannel = urlParams.get("kick") || "";
export let subBadges;
export let userId;

let kickWS = null;
const kickWSUri =
  "wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=7.6.0&flash=false";

// Function to establish a WebSocket connection
function connectWebSocket() {
  kickWS = new WebSocket(kickWSUri);

  // Listen for open, error and close events
  kickWS.addEventListener("open", handleWebSocketOpen);
  kickWS.addEventListener("error", handleWebSocketError);
  kickWS.addEventListener("close", handleWebSocketClose);
  kickWS.addEventListener("message", handleWebSocketMessage);
}

function closeWebSocket() {
  kickWS.close();
}

// Handle WebSocket open event
async function handleWebSocketOpen() {
  const channelInfo = await getChannelInfo();
  const chatroomId = channelInfo.chatroomId;
  kickWS.send(
    JSON.stringify({
      event: "pusher:subscribe",
      data: { auth: "", channel: `chatrooms.${chatroomId}.v2` }
    })
  );

  console.log(
    "Connected to Kick.com Streamer Chat: " +
      kickChannel +
      " Chatroom ID: " +
      chatroomId
  );
}

// Fetch channel information and retrieve sub badges
async function getChannelInfo() {
  const response = await fetchData(
    `https://kick.com/api/v2/channels/${kickChannel}`
  );
  const data = await response.json();
  const chatroomId = data.chatroom.id;
  const userId = data.user_id;
  subBadges = data.subscriber_badges || [];
  subBadges.sort((a, b) => (a.months > b.months ? 1 : -1));

  fetch7TVEmotes(userId);
  console.log("Kick Subscriber Badges:", subBadges); // Log the sub badges

  return { chatroomId, subBadges };
}

// Existing function to handle fetching data
async function fetchData(url) {
  let response;
  while (!response || !response.ok) {
    try {
      response = await fetch(url);
      if (!response.ok) {
        console.log("Error: " + response.status);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.log("Error: " + error);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  return response;
}

// Handle WebSocket errors
function handleWebSocketError() {
  console.log("WebSocket error. Reconnecting...");
  setTimeout(() => {
    connectWebSocket();
  }, 1000);
}

// Handle WebSocket disconnection
function handleWebSocketClose() {
  console.log("WebSocket disconnected. Reconnecting...");
  setTimeout(() => {
    connectWebSocket();
  }, 1000);
}

// Call connectWebSocket to establish the initial connection
if (kickWS === null) {
  connectWebSocket();
}

// Handle WebSocket messages
function handleWebSocketMessage(event) {
  // Parse the message data as JSON
  let messageData = JSON.parse(event.data);

  // Check if the message is a ChatMessageEvent
  if (messageData.event === "App\\Events\\ChatMessageEvent") {
    // Parse the data property as JSON
    let chatMessageData = JSON.parse(messageData.data);
    let messageID = chatMessageData.id;
    let chatMessageSender = chatMessageData.sender;
    let chatMessageBadges = chatMessageSender.identity.badges;
    let subscriberBadge = chatMessageBadges.find(
      (badge) => badge.type === "subscriber"
    );
    let subscriberAge = subscriberBadge ? subscriberBadge.count : 0;

    // Store the properties of the chatMessageData object in temporary variables
    let messageContent = chatMessageData.content;
    let messageUsername = chatMessageSender.username;
    // let messageCreatedAt = chatMessageData.created_at;
    let messageUserID = chatMessageSender.id;
    let senderColor = chatMessageSender.identity.color;
    let senderBadges = [];

    // Iterate over the badges array
    for (let badge of chatMessageBadges) {
      // Add the badge type to the senderBadges array
      senderBadges.push(badge.type);
    }

    prependMessage(
      messageID,
      messageContent,
      messageUsername,
      senderColor,
      messageUserID,
      senderBadges,
      subscriberAge
    );
  }

  // Check if Message Deleted Event
  if (messageData.event === "App\\Events\\MessageDeletedEvent") {
    let DeleteMessageData = JSON.parse(messageData.data);
    let messageID = DeleteMessageData.message.id;

    console.log(messageID);
    // Call the function to remove the message
    removeChatMessage(messageID);
  }

    // Check if User Ban Event
    if (messageData.event === "App\\Events\\UserBannedEvent") {
      let banData = JSON.parse(messageData.data);
      let banUserData = banData.user;
      let banUserID = banUserData.id;
  
      console.log("Banned UserID", banUserID);
  
      // Find all messages from banned UserID and delete
      const bannedUserMessages = document.querySelectorAll(
        `.message-item[user-id="${banUserID}"]`
      );
  
      // Remove each message
      bannedUserMessages.forEach((messageElement) => {
        messageElement.remove();
      });
    }
}
