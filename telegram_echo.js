/**
 * Copyright 2016 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *            http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// this is a simple echo response where TJ Bot will reply with the words he heard or read on telegram.

const TJBot = require('tjbot');
const config = require('./config');
const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const fs = require('fs');
const temp = require('temp').track();

// obtain our credentials from config.js
const credentials = config.credentials;

// these are the hardware capabilities that TJ needs for this recipe
var hardware = ['speaker'];

// set up TJBot's configuration
var tjConfig = {
    log: {
        level: 'verbose'
    }
};

// instantiate our TJBot!
var tj = new TJBot(hardware, tjConfig, credentials);

// Create a bot that uses 'polling' to fetch new updates 
const telegram = new TelegramBot(credentials.telegram.token, { polling: true });

telegram.on("text", (msg) => {
    // 'msg' is the received Message from Telegram
    const chatId = msg.chat.id;
    const text = msg.text;

    tj.speak(text);
    telegramSendVoice(chatId, text);
});

telegram.on("voice", (msg) => {
    // 'msg' is the received Message from Telegram
    const chatId = msg.chat.id;

    telegram.getFileLink(msg.voice.file_id)
    .then(function (voiceUrl) {
        temp.open('tjbot', function (err, info) {
            if (err)
                return console.log("error: could not open temporary file for writing at path: " + info.path);

            request(voiceUrl).pipe(fs.createWriteStream(info.path))
            .on('finish', function () {
                var params = {
                    audio: fs.createReadStream(info.path),
                    content_type: 'audio/ogg',
                    smart_formatting: true
                };
                tj._stt.recognize(params, function (err, transcript) {
                    if (err)
                        return console.log("error: ", + err);

                    try {
                        var text = transcript.results[0].alternatives[0].transcript;

                        console.log("STT transcipt: " + text);

                        tj.speak(text);
                        telegramSendVoice(chatId, text);
                    } catch (err) {
                        console.log("error: ", err);
                    }
                });
            })
            .on("error", function (err) {
                console.log("error request", err);
            });
        });
    })
    .catch(function (err) {
        console.log("error: ", err);
    })
});

function telegramSendVoice(chatId, text) {
    var params = {
        text,
        accept: 'audio/ogg'
    };
    temp.open('tjbot', function (err, info) {
        if (err)
            return console.log("error: could not open temporary file for writing at path: " + info.path);

        tj._tts.synthesize(params).pipe(fs.createWriteStream(info.path))
        .on('finish', function () {
            telegram.sendVoice(chatId, info.path)
            .catch(function (err) {
                console.log("error sendVoice: ", err);
            });
        })
        .on("error", function (err) {
            console.log("error synthesize", err);
        });
    });
}