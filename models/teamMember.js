const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const teamMemberSchema = new Schema({
  name: {
   type: String,
   required: true
  },
  email: {
    type: String,
    required: true
  },
  role: {
   type: String,
   required: true
  },
  phone: {
   type: String,
   required: true
  },
  creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
  },
});

module.exports = mongoose.model('TeamMember', teamMemberSchema);