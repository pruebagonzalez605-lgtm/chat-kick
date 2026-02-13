import { prependMessage, removeExcessMessages, fadeRemoveMessage } from "./app.js";

const settingsUrlParams = new URLSearchParams(window.location.search);
const fontURL = settingsUrlParams.get("font") || "Inter";
const fontSizeURL = settingsUrlParams.get("fontSize") || "Large";
const fontShadowURL = settingsUrlParams.get("fontShadow") || "none";
const fontColorParam = settingsUrlParams.get("fontColor");
const fontColorURL = fontColorParam
  ? fontColorParam.replace("%23", "#")
  : "#ffffff";
const fontCaseURL = settingsUrlParams.get("fontCase") || "none";
const themeURL = settingsUrlParams.get("theme") || "custom";
const timestampURL = settingsUrlParams.get("timestamp") || "off";
const platformURL = settingsUrlParams.get("platformBadges") || "off";
const userBadgesURL = settingsUrlParams.get("userBadges") || "off";
const botsURL = settingsUrlParams.get("bots") || "off";
const highlightURL = settingsUrlParams.get("highlight") || "off";
const fadeURL = settingsUrlParams.get("fade") || "off";
const fadeTimeURL = (parseInt(settingsUrlParams.get("fadeTime")) || 30) * 1000;

console.log(
  "Custom Settings - ",
  "Font: ",
  fontURL,
  " Size: ",
  fontSizeURL,
  " Shadow: ",
  fontShadowURL,
  " Color: ",
  fontColorParam,
  " Case: ",
  fontCaseURL,
  " Theme: ",
  themeURL,
  " Timestamps: ",
  timestampURL,
  " Platform Badges: ",
  platformURL,
  " User Badges: ",
  userBadgesURL,
  " Bots: ",
  botsURL
);

const fontOptions = [
  "Asap Condensed",
  "Barlow Condensed",
  "Caveat",
  "Charm",
  "Crimson Text",
  "Dosis",
  "Exo",
  "Inter",
  "Itim",
  "Oswald",
  "Roboto",
  "Teko",
  "Ubuntu",
  "Zilla Slab"
];

const fontShadowMap = {
  "shadow-na": "1",
  "shadow-sm": "2",
  "shadow-m": "3",
  "shadow-lg": "4"
};

// Get the root element
const root = document.documentElement;

// Create a unique id for the new Google Font stylesheet
const fontLinkId = `font-${fontURL.replace(/ /g, "-")}`;

const fontLink = document.createElement("link");
fontLink.setAttribute("rel", "stylesheet");
fontLink.setAttribute("id", fontLinkId);
fontLink.setAttribute(
  "href",
  `https://fonts.googleapis.com/css?family=${fontURL.replace(/ /g, "+")}`
);
document.head.appendChild(fontLink);

// Apply the selected font
root.style.setProperty("--font", `'${fontURL}', sans-serif`);

// Apply font size style
const selectedSize = fontSizeURL;
root.style.setProperty("--font-size", selectedSize);

// Apply font case style
const selectedFontCase = fontCaseURL;
root.style.setProperty("--font-case", selectedFontCase);

// Apply font shadow style
const selectedFontShadow = fontShadowURL;
const fontShadowValue = fontShadowMap[selectedFontShadow];
root.style.setProperty(
  "--font-shadow",
  `var(--font-shadow-${fontShadowValue})`
);

// Apply font color style
const selectedFontColor = fontColorURL;
root.style.setProperty("--font-color", selectedFontColor);

// Apply theme style
const selectedTheme = themeURL;
if (selectedTheme !== "custom") {
  const head = document.getElementsByTagName("head")[0];
  const newThemeLink = document.createElement("link");
  newThemeLink.id = "custom-theme";
  newThemeLink.rel = "stylesheet";
  newThemeLink.href = `templates/${selectedTheme}.css`;
  head.appendChild(newThemeLink);
}

function createStyleTag(id, css) {
  const head = document.getElementsByTagName("head")[0];
  const styleTag = document.createElement("style");
  styleTag.id = id;
  styleTag.innerHTML = css;
  head.appendChild(styleTag);
}

// Show or Hide Timestamp
createStyleTag(
  "timestamp-style",
  timestampURL === "on"
    ? '.timestamp { display: "" !important; }'
    : ".timestamp { display: none; }"
);

// Show or Hide Platform Badges
createStyleTag(
  "platformBadges-style",
  platformURL === "on"
    ? '.logo-kick, .logo-twitch { display: "" !important; }'
    : ".logo-kick, .logo-twitch { display: none !important; }"
);

// Show or Hide User Badges
createStyleTag(
  "userBadges-style",
  userBadgesURL === "on"
    ? '.user-badges { display: "" !important; }'
    : ".user-badges { display: none !important; }"
);

// Show or Hide Bots
createStyleTag(
  "bot-style",
  botsURL === "on"
    ? '.bot { display: "" !important; }'
    : ".bot { display: none !important; }"
);

export { fadeURL, fadeTimeURL };