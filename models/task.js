const mongoose = require('mongoose');



const Schema = mongoose.Schema;


const taskSchema = new Schema({
 title: {
  type: String,
  required: true
 },
 description: {
  type: String,
  required: true
 },
 status: {
  type: String,
  required: true 
 },
 priority: {
  type: String,
  required: true
 },
 assignedTo: {
  type: String,
  required: true
 },

 system: {
  type: String,
  required: true
 },
 fileSystem: String,
 fileName: String,

 workingHoursToComplete:{
  type: String,
 },
 creator: Object,
 assignedTo: Object,
  creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
  },
teamMemberId: {
  type: Schema.Types.ObjectId,
  ref: 'TeamMember'
},
createdAt: String,
updatedAt: String,
}, );


module.exports = mongoose.model('Task', taskSchema);