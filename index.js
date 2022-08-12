const express= require('express');
const path = require('path');
const app = express();
const nodemailer = require('nodemailer');
const port = 3000;
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(express.static(path.join(__dirname,'/public')))
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'/views'));
const fromemail='nagateja590@gmail.com';
const dbenv = 'mongodb+srv://Nagateja12:Naga2402.@otp-authentication.ehcpgop.mongodb.net/?retryWrites=true&w=majority'||"mongodb://localhost:27017/codefury";
const password = 'pujjfzoarsmooprx';
mongoose.connect(dbenv, {useNewUrlParser: true});

const signupSchema = {
    name: String,
    email: String,
    contact: Number,
    password: String
  };
  
  const otpSchema = {
    otp: String,
    email: String
  };

  const signup = mongoose.model("Item",signupSchema);
  const otps = mongoose.model("otp", otpSchema);



// sent otp
// var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: fromemail,
    pass: password
  }
});



// reset password
// _________________________________________________________________________________
app.get('/reset-password',(req,res)=>{
  res.render('reset');
})

app.post('/reset-password',(req,res)=>{
    const email = req.body.email;
    signup.findOne({email: email},(err,data)=>{
      if(err){
        res.redirect('/signup');
      }else{
        var otp1 = Math.floor(Math.random()*1000000);
        var newotp = new otps;
        newotp.otp = otp1;
        newotp.email = email;
        newotp.save((err,data)=>{
          if(err)throw err;
          else console.log('otp inserted');
        })
        res.redirect(`/otp-verify/${email}`);
      }
    })
})

app.get('/otp-verify/:email',(req,res)=>{
  const {email} = req.params;
  otps.findOne({email: `${email}`},(err,data)=>{
    if(err)throw err;
    else{
          var mailOptions = {
            from: fromemail,
            to: email,
            subject: 'Reset password',
            text: `This is the new otp to reset password, the otp is ${data.otp}`
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
          res.render('otp-verify',{data});
        
      
      
      
    }
  })
})

app.post('/otp-verify',(req,res)=>{
  const otpentered = req.body.otp;
  const email = req.body.email;
  otps.findOne({email: `${email}`},(err,data)=>{
    if(err) throw err;
    else{
      if(otpentered!=data.otp){
        res.redirect('/reset-password');
      }else{
        signup.findOneAndUpdate({email: `${email}`},{password: req.body.newpass},(err)=>{
          if(err) throw err;
          else{
              console.log("new password updated")
          }
        });
        otps.findOneAndDelete({email: `${email}`},(err)=>{
          if(err) throw err;
          else{
            console.log("otp deleted")
          }
        });
        res.redirect('/signin');
      }
    }
  })
  
  
})




// Signup
// -----------------------------------------------------------------------

app.get('/signup',(req,res)=>{
    res.render('signup');
})

app.post('/signup',(req,res)=>{
    var newsignup = new signup;
    newsignup.name = req.body.fullname;
    newsignup.email = req.body.email;
    newsignup.contact = req.body.contact;
    newsignup.password = req.body.password;
    if(req.body.password!=req.body.confirm){
        res.redirect('/signup');
    }
    newsignup.save((err,data)=>{
        if(err) throw err;
        else
        console.log("data inserted!!");
    })

    res.redirect('/')
})
 
// signin
// --------------------------------------------------------------------------
app.get('/signin',(req,res)=>{
    res.render('signin');
})
app.post('/signin',(req,res)=>{
    signup.findOne({email: req.body.email},(err,data)=>{
        if(err) throw err;
        else{
            if(data.password!=req.body.password){
                res.redirect('/signin');
                res.send('incorect password');
            }
            else
                res.redirect('/');
        }
    })
})


app.get('/',(req,res)=>{
    res.render('home')
})






app.listen(process.env.PORT||port,()=>{
    console.log(`server is running at ${port}`)
})