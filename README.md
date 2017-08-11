# Telegram
> Chat with TJBot through Telegram!

This recipe uses the [Watson Speech to Text](https://www.ibm.com/watson/developercloud/speech-to-text.html), [Watson Text to Speech](https://www.ibm.com/watson/developercloud/text-to-speech.html) and [Watson Conversation](https://www.ibm.com/watson/developercloud/conversation.html) services to turn TJ into a chatting robot through Telegram.

## Hardware
This recipe requires a TJBot with a speaker, and optionally LED and servo

## Build and Run
First, make sure you have configured your Raspberry Pi for TJBot.

    $ cd tjbot/bootstrap && sudo sh bootstrap.sh

Clone the `psyntium/tjtelegram` recipe and install the dependencies.

    $ git clone git://github.com/psyntium/tjtelegram.git 
    $ cd tjtelegram
    $ npm install

Create instances of the [Watson Speech to Text](https://www.ibm.com/watson/developercloud/speech-to-text.html), [Watson Text to Speech](https://www.ibm.com/watson/developercloud/text-to-speech.html) and [Watson Conversation](https://www.ibm.com/watson/developercloud/conversation.html) services and note the authentication credentials.

Import the `workspace-sample.json` file into the Watson Conversation service and note the workspace ID.

Make a copy the default configuration file and update it with the Watson service credentials and the conversation workspace ID.

    $ cp config.default.js config.js
    $ nano config.js
    <enter your credentials and the conversation workspace ID in the specified places>

Run!

    sudo node telegram.js

> Note the `sudo` command. Root user access is required to run TJBot recipes.

# Watson Services
- [Watson Speech to Text](https://www.ibm.com/watson/developercloud/speech-to-text.html)
- [Watson Text to Speech](https://www.ibm.com/watson/developercloud/text-to-speech.html)
- [Watson Conversation](https://www.ibm.com/watson/developercloud/conversation.html)

# License
This project is licensed under Apache 2.0. Full license text is available in [LICENSE](../../LICENSE).

# Contributing
See [CONTRIBUTING.md](../../CONTRIBUTING.md).