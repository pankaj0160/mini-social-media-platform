const fs = require("fs");
const path = require("path");

const apiBaseUrl = process.env.API_BASE_URL || "http://localhost:5000";

const configContent = `window.APP_CONFIG = {
  API_BASE_URL: "${apiBaseUrl}"
};
`;

fs.writeFileSync(
  path.join(__dirname, "js", "config.js"),
  configContent
);

console.log("config.js generated successfully with API_BASE_URL:", apiBaseUrl);
