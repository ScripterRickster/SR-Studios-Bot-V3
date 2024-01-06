const mongoose = require('mongoose');

module.exports = mongoose.model(

  "modlogs",
  new mongoose.Schema({
    userId: String,
    type: String,
    guildId: String,
    moderatorId: String,
    reason: String,
    timestamp: String,
    duration: String,
  })
  
)
  
