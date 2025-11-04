const mongoose=require('mongoose');
// const bcrypt=require('bcrypt')

//define a person schema
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    age:{
        type:Number,
        require:true
    },
    mobile:{
        type:String,
    },
    email:{
        type:String,
        unique:true
    },
    address:{
        type:String,
        required:true
    },
    aadharCardNumber:{
        typeof:Number,
        require:true,
        unique:true
    },
    password:{
        type:String,
        require:true
    },
    role:{
        type:String,
        enum:['voter','admin'],
        default:'voter'
    },
    isVoted:{
        type:Boolean,
        default:false
    }
})

//create person model
const User=mongoose.model('User',userSchema);
module.exports=User;
