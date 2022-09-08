const {GraphQLObjectType, GraphQLID, GraphQLString, GraphQLSchema, GraphQLList, GraphQLInt, GraphQLNonNull, buildClientSchema,} = require('graphql');
const jwt = require('jsonwebtoken');
const bcrypt =require('bcryptjs');

const Task = require('../models/task');
const User = require('../models/user');
const TeamMember = require('../models/teamMember')



const TeamMemberType = new GraphQLObjectType({
  name: 'TeamMember',
  fields: () => ({
    id: {type: GraphQLID},
    name: {type: GraphQLString},
    role: {type: GraphQLString},
    email: {type: GraphQLString},
    phone: {type: GraphQLString},
    creatorId: {type: GraphQLID},
    creator: {
    type: UserType,
    resolve(parent, args){
      return User.findById(parent.creatorId);
     
    }
  },

  })
});

const UserType = new GraphQLObjectType({
 name: 'User',
 fields: () => ({
  id: { type: GraphQLID },
  name: { type: GraphQLString },
  email: { type: GraphQLString },
  password: { type: GraphQLString },
  role: { type: GraphQLString },
  fileSystem: { type: GraphQLString },
  fileName: { type: GraphQLString },
  token: { type: GraphQLString },
  tokenExpiration: { type: GraphQLInt},
  tasks: {
   type: new GraphQLList(TaskType),
   resolve(parent, args){
    return Task.find({creatorId:parent.id})
   }
  },
  teamMembers: {
   type: new GraphQLList(TeamMemberType),
   resolve(parent, args){
    return TeamMember.find({creatorId:parent.id})
   }
  },

 })

});

const AuthType = new GraphQLObjectType({
 name: 'AuthData',
 fields: () => ({
  id: { type: GraphQLID },
  user: {type: UserType, 
  resolve(parent, args){
    return User.findById(parent.id)
}},
  name: { type: GraphQLString },
  token: { type: GraphQLString },
  tokenExpiration: { type: GraphQLInt},
  fileSystem: { type: GraphQLString },
  
 })
})

const TaskType = new GraphQLObjectType({
 name: 'Task',
 fields: () => ({
  id: { type: GraphQLID },
  creatorId: { type: GraphQLID },
  teamMemberId: { type: GraphQLID },
  title: { type: GraphQLString },
  description: { type: GraphQLString },
  system: { type: GraphQLString },
  status: { type: GraphQLString },
  priority: { type: GraphQLString },
  fileSystem: { type: GraphQLString },
  fileName: { type: GraphQLString },
  creator: {
    type: UserType,
    resolve(parent, args){
      return User.findById(parent.creatorId);
     
    }
  },

  assignedTo: { 
    type: TeamMemberType,
      resolve(parent, args){
       return TeamMember.findById(parent.teamMemberId)
      
    }
   },
  workingHoursToComplete: { type: GraphQLString },
  createdAt: { type: GraphQLString },
  updatedAt: { type: GraphQLString },
 })
})


const RootQuery = new GraphQLObjectType({
 name: 'RootQueryType',
 fields: {

  teamMembers: {
    type: new GraphQLList(TeamMemberType),
    resolve(parent, args){
      return TeamMember.find().sort({_id: -1})
    }
  },

  teamMember: {
    type: TeamMemberType,
    args: {
      id: {type: GraphQLID} 
    },
    resolve(parent, args){
      return TeamMember.findById(args.id);
    }
  },
  tasks: {
   type: new GraphQLList(TaskType),
   resolve(parent, args){
     return Task.find().sort({_id: -1});
   }
  },
  task: {
   type: TaskType ,
   args: {id: {type: GraphQLID}},
   resolve(parent, args){
    return Task.findById(args.id);
   }
  },
  users: {
   type: new GraphQLList(UserType),
   resolve(parent, args){
    return User.find();
   }
  },
  user: {
   type: UserType,
   args: {id: {type: GraphQLID}},
   resolve(parent, args){
    return User.findById(args.id)
   }
  }
 }
})


const mutation = new GraphQLObjectType({
 name: 'Mutation',
 fields: {
    login: {
   type: AuthType,
   args:{
    email: {type: GraphQLString},
    password: {type: GraphQLString},
   },
   async resolve(parent, args){
    const user =  await User.findOne({ email: args.email });
    if (!user) {
      throw new Error('User does not exist!');
    }
    
    const isEqual = await bcrypt.compare(args.password, user.password)
    if (!isEqual) {
      throw new Error('Password is incorrect!');
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.AUTH_SECRET,
      {
        expiresIn: '1h'
      }
    );
    return { id: user.id, name: user.name, token: token, fileSystem:user.fileSystem, user, tokenExpiration: 1 };
   }
  },

  logout: {
    type: UserType,
    args: { 
      id: {type: GraphQLID},
    },
    async resolve(parent, args){
      
      return {id: args.id, token: null, tokenExpiration: null}
    }
  },

  addUser: {
   type: UserType,
   args: {
    name: { type: GraphQLNonNull(GraphQLString) },
    email: { type: GraphQLNonNull(GraphQLString) },
    password: { type: GraphQLNonNull(GraphQLString) },
    role: { type: GraphQLNonNull(GraphQLString) },
    fileSystem: { type: GraphQLString},
    fileName: { type: GraphQLString},
   },
   async resolve(parent, args){
    const existingUser = await User.findOne({email: args.email})
    if(existingUser){
      return ('User already exists')
    }else{
    const hashedPassword = await bcrypt.hash(args.password, 12);
    const user = new User({
     name: args.name,
     email: args.email,
     password: hashedPassword,
     role: args.role,
     fileSystem: args.fileSystem,
     fileName: args.fileName
    })
   const newUser = await user.save();
       const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.AUTH_SECRET,
      {
        expiresIn: '1h'
      }
    );
      return {id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role,
      fileSystem: newUser.fileSystem,
      token,
      tokenExpiration: 1}
   }
  }
  },
  updateUser: {
    type: UserType,
    args: {
    id: {type: GraphQLNonNull(GraphQLID)},
    name: { type: GraphQLNonNull(GraphQLString) },
    email: { type: GraphQLNonNull(GraphQLString) },
    password: { type: GraphQLNonNull(GraphQLString) },
    role: { type: GraphQLNonNull(GraphQLString) },
    fileSystem: { type: GraphQLString},
    fileName: { type: GraphQLString},
   },
    async resolve(parent, args){
    const hashedPassword = await bcrypt.hash(args.password, 12);
    const token = jwt.sign(
      { userId: args.id, email: args.email },
      process.env.AUTH_SECRET,
      {
        expiresIn: '1h'
      }
    );

    if(args.fileSystem){

      return User.findByIdAndUpdate(args.id, {
        $set: {
          name: args.name,
          email: args.email,
          password: hashedPassword,
          role: args.role,
          fileSystem: args.fileSystem,
          fileName: args.fileName,
          token: token
        }
      }, {new: true})
   }else{
          return User.findByIdAndUpdate(args.id, {
        $set: {
          name: args.name,
          email: args.email,
          password: hashedPassword,
          role: args.role,
          token: token
        }
      }, {new: true})

   }
    }
  },
  deleteUser: {
    type: UserType,
    args: {
      id: { type: GraphQLID }
    },
    resolve(parent, args){
      return User.findByIdAndRemove(args.id);
    }
  }, 

  addTeamMember: {
    type: TeamMemberType,
    args: {
      creatorId: {type: GraphQLID},
      name: {type: GraphQLNonNull(GraphQLString)},
      email: {type: GraphQLNonNull(GraphQLString)},
      phone: {type: GraphQLNonNull(GraphQLString)},
      role: {type: GraphQLNonNull(GraphQLString)},
    },
    resolve(parent, args, req){
      const member = new TeamMember({
        creatorId: args.creatorId,
        name: args.name,
        email: args.email,
        phone: args.phone,
        role: args.role,
      })
      return member.save();
    }
  },

  deleteTeamMember: {
    type: TeamMemberType,
    args: {
      id: {type: GraphQLID}
    },
    resolve(parent, args){

      return TeamMember.findByIdAndRemove(args.id)
    }
  },

  addTask: {
  type: TaskType,
  args: {
  creatorId: {type: GraphQLID},
  teamMemberId: {type: GraphQLID},
  title: { type: GraphQLString },
  description: { type: GraphQLString },
  system: { type: GraphQLString },
  status: { type: GraphQLString },
  priority: { type: GraphQLString },
  workingHoursToComplete: { type: GraphQLString },
  createdAt: {type: GraphQLString},
  fileSystem: {type: GraphQLString},
  fileName: {type: GraphQLString},
  },
  resolve(parent, args){
    let task = new Task({
      creatorId: args.creatorId,
      teamMemberId: args.teamMemberId,
      title: args.title,
      description: args.description,
      status: args.status,
      system: args.system,
      priority: args.priority,
      workingHoursToComplete: args.workingHoursToComplete,
      createdAt: args.createdAt,
      fileSystem: args.fileSystem,
      fileName: args.fileName
    })
    
    
    return task.save();
  }
  }, 
  deleteTask: {
    type: TaskType,
    args: {
      id: {type: GraphQLID}
    },
    resolve(parent, args){
      return Task.findByIdAndRemove(args.id);
    }
  },
  updateTask: {
    type: TaskType,
    args: {
      id: {type: GraphQLNonNull(GraphQLID)},
      // creatorId: {type: GraphQLID},
      teamMemberId: {type: GraphQLID},
      title: {type: GraphQLString},
      description: {type: GraphQLString},
      priority: {type: GraphQLString},
      status: {type: GraphQLString},
      system: {type: GraphQLString},
      workingHoursToComplete: {type: GraphQLString},
      updatedAt: {type: GraphQLString},
      fileSystem: {type: GraphQLString},
      fileName: {type: GraphQLString},
    },
    resolve(parent, args){
      if(args.fileSystem){
      return Task.findByIdAndUpdate(args.id, {
        $set: {
          teamMemberId: args.teamMemberId,
          // creatorId: args.creatorId,
          title: args.title,
          description: args.description,
          system: args.system,
          status: args.status,
          priority: args.priority,
          workingHoursToComplete: args.workingHoursToComplete,
          fileSystem: args.fileSystem,
          updatedAt: args.updatedAt,
          fileName: args.fileName,
          fileSystem: args.fileSystem
        }
      }, {new: true})

      }else{
      return Task.findByIdAndUpdate(args.id, {
        $set: {
          teamMemberId: args.teamMemberId,
          // creatorId: args.creatorId,
          title: args.title,
          description: args.description,
          system: args.system,
          status: args.status,
          priority: args.priority,
          workingHoursToComplete: args.workingHoursToComplete,
          fileSystem: args.fileSystem,
          updatedAt: args.updatedAt,
        }
      }, {new: true})

      }
    }
  },
 }
})


module.exports = new GraphQLSchema({
 query: RootQuery,
 mutation,
})