const _uploader = require("./multer");
const _pusherInstance = require("./pusherConfig");

console.log("config..")

module.exports = {
  uploader: _uploader,
  pusherInstance: _pusherInstance
}