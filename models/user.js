const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
   type: String,
   required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
   type: String,
   required: true
  },
  fileSystem: String,
  fileName: String,
  tasks: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Task'
    }
  ], 
  teamMembers: [
     {
      type: Schema.Types.ObjectId,
      ref: 'TeamMember'
    }
  ],
 
});

module.exports = mongoose.model('User', userSchema);