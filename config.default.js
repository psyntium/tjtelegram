/*
User-specific configuration
    ** IMPORTANT NOTE ********************
    * Please ensure you do not interchange your username and password.
    * Hint: Your username is the lengthy value ~ 36 digits including a hyphen
    * Hint: Your password is the smaller value ~ 12 characters
*/

// Create the credentials object for export
exports.credentials = {};

// Telegram Bot
// https://www.npmjs.com/package/node-telegram-bot-api
// replace the value below with the Telegram token you have received from @BotFather 
exports.credentials.telegram = {
    token: "YOUR_TELEGRAM_BOT_TOKEN"
}

// Watson Speech To Text
// replace the value below with the Waton's Speech to Text token you have received from @BotFather 
exports.credentials.speech_to_text = {
    password: "",
    username: ""
}

// Watson Text to Speech
// replace the value below with the Waton's Text to Speech username/password
exports.credentials.text_to_speech = {
    username: "",
    password: ""
}