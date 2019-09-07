const express=require("express")
const login=require("./routes/loginroutes");
const topic=require("./routes/topicRoutes");
const comment=require("./routes/commentRoutes");

const bodyParser=require("body-parser")
const jwt = require('jsonwebtoken');

const port=3000;

const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


app.get("/", (req, res)=>{
    res.json({status: "hello"})
    
})
app.post("/register", login.register);
app.post("/login", login.login);
app.post("/reset", login.reset);

app.post('/createtopic', verifyToken, topic.createTopic)
app.put("/modifytopic",verifyToken, topic.modifyTopic);
app.get("/findtopic", verifyToken, topic.getTopic);
app.delete("/deletetopic", verifyToken, topic.deleteTopic);
app.get("/getall", verifyToken, topic.getAll);

app.post("/createcomment", verifyToken, comment.createComment);
app.put("/modifycomment",verifyToken, comment.modifyComment);
app.get("/findcomment", verifyToken, comment.getComment);
app.delete("/deletecomment", verifyToken, comment.deleteComment);
app.get("/search-comments", verifyToken, comment.searchText);




function verifyToken(req, res, next) {
    const Header = req.headers['authorization'];
    if(typeof Header !== 'undefined') {
      req.token=Header
      jwt.verify(req.token, 'secretkey', (err, authData) => {
        if(err) {
          console.log(err)
          res.sendStatus(403);
         }
         else {
         req.email=authData.users.email;
         next(); 
          
          // res.json({
          //   message: 'Post created...',
          //   authData
            
          // });
         }
      });
    
    } 
    else {
      res.sendStatus(403);
      

    }
  }

app.listen(port,()=>{
    console.log(`Listening on port ${port}`)
})