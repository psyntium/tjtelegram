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

const TJBot = require('tjbot');
const config = require('./config');
const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const fs = require('fs');
const temp = require('temp').track();

// obtain our credentials from config.js
const credentials = config.credentials;

// obtain user-specific config
var WORKSPACEID = config.conversationWorkspaceId;

// these are the hardware capabilities that TJ needs for this recipe
var hardware = ['speaker', 'led', 'servo'];
// disable servo if running locally on pc
// var hardware = ['speaker', 'led'];

// set up TJBot's configuration
var tjConfig = {
    log: {
        level: 'verbose'
    }
};

// instantiate our TJBot!
var tj = new TJBot(config.hardware || hardware, tjConfig, credentials);

// Create a bot that uses 'polling' to fetch new updates 
const telegram = new TelegramBot(credentials.telegram.token, { polling: true });

telegram.on("text", (msg) => {
    // 'msg' is the received Message from Telegram
    const chatId = msg.chat.id;
    const text = msg.text;

    // send to the conversation service
    tj.converse(WORKSPACEID, text, function (response) {
        tj.speak(response.description);
        telegramSendVoice(chatId, response.description);

        runAction(response.object.output.action);
    });
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

                                // send to the conversation service
                                tj.converse(WORKSPACEID, text, function (response) {
                                    tj.speak(response.description);
                                    telegramSendVoice(chatId, response.description);

                                    runAction(response.object.output.action);
                                });
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

function runAction(action) {
    if (action) {
        if (action.led == "on") {
            tj.shine(action.color || "white");
        } else if (action.led == "off") {
            tj.shine("off");
        }

        if (action.servo) {
            if (action.movement == "armback") {
                tj.armBack();
            } else if (action.movement == "raisearm") {
                tj.raiseArm();
            } else if (action.movement == "lowerarm") {
                tj.lowerArm();
            } else if (action.movement == "wave") {
                tj.wave();
            } else {
                tj.wave();
            }
        }
    }
}