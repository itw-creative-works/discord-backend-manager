<p align="center">
  <a href="https://itwcreativeworks.com">
    <img src="https://cdn.itwcreativeworks.com/assets/itw-creative-works/images/logo/itw-creative-works-brandmark-black-x.svg" width="100px">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/github/package-json/v/itw-creative-works/discord-bot-manager.svg">
  <br>
  <img src="https://img.shields.io/librariesio/release/npm/discord-bot-manager.svg">
  <img src="https://img.shields.io/bundlephobia/min/discord-bot-manager.svg">
  <img src="https://img.shields.io/codeclimate/maintainability-percentage/itw-creative-works/discord-bot-manager.svg">
  <img src="https://img.shields.io/npm/dm/discord-bot-manager.svg">
  <img src="https://img.shields.io/node/v/discord-bot-manager.svg">
  <img src="https://img.shields.io/website/https/itwcreativeworks.com.svg">
  <img src="https://img.shields.io/github/license/itw-creative-works/discord-bot-manager.svg">
  <img src="https://img.shields.io/github/contributors/itw-creative-works/discord-bot-manager.svg">
  <img src="https://img.shields.io/github/last-commit/itw-creative-works/discord-bot-manager.svg">
  <br>
  <br>
  <a href="https://itwcreativeworks.com">Site</a> | <a href="https://www.npmjs.com/package/discord-bot-manager">NPM Module</a> | <a href="https://github.com/itw-creative-works/discord-bot-manager">GitHub Repo</a>
  <br>
  <br>
  <strong>Discord Bot Manager</strong> is an NPM module for backend and frontend developers that exposes powerful utilities and tools.
</p>

## 🦄 Features
* Easily setup a general purpose discord bot
* Firebase integration
* 30+ useful commands

## 📦 Install Discord Bot Manager
### Option 1: Install via npm
Install with npm if you plan to use **Discord Bot Manager** in a Node.js project.
```shell
npm install discord-bot-manager
```

```js
// Initialize the bot manager
const DiscordBotManager = require('discord-bot-manager');
const manager = new DiscordBotManager();

// Initialize the bot manager
manager.init();
```

## Setup
### Create folder structure
```
servers
│
├── {server-name}
│   ├── config
│   │   ├── channels.js
│   │   ├── emojis.js
│   │   ├── main.js
│   │   ├── roleMenu.js
│   │   ├── roles.js
│   │   └── settings.js
│   │
│   ├── .env
│   ├── backend-manager-config.json
│   └── service-account.json
│
└── index.js
```

And what to put for these files?

#### .env
```txt
BACKEND_MANAGER_KEY=your-backend-manager-key
```

## 🗨️ Final Words
If you are still having difficulty, we would love for you to post a question to [the Discord Bot Manager issues page](https://github.com/itw-creative-works/discord-bot-manager/issues). It is much easier to answer questions that include your code and relevant files! So if you can provide them, we'd be extremely grateful (and more likely to help you find the answer!)

## 📚 Projects Using this Library
[Somiibo](https://somiibo.com): A Social Media Bot with an open-source module library. <br>
[StudyMonkey](https://studymonkey.ai): An AI tutor for students. <br>
[JekyllUp](https://jekyllup.com): A website devoted to sharing the best Jekyll themes. <br>
[Slapform](https://slapform.com): A backend processor for your HTML forms on static sites. <br>
[Proxifly](https://proxifly.com): A backend processor for your HTML forms on static sites. <br>
[SoundGrail Music App](https://app.soundgrail.com): A resource for producers, musicians, and DJs. <br>
[Hammock Report](https://hammockreport.com): An API for exploring and listing backyard products. <br>

Ask us to have your project listed! :)
