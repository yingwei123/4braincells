const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const bodyparser = require('body-parser')
const path = require('path')
var mongoose = require('mongoose');
require('dotenv').config()


mongoose.connect(process.env.MONGODB_URI||'mongodb://localhost:27017/4braincells',  { useNewUrlParser: true,useUnifiedTopology: true })
mongoose.set('useFindAndModify', false);


app.use(bodyparser.json())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'views')));
app.set('view engine', 'pug');
app.listen(process.env.PORT || 3000,()=>{
    console.log("Server is listening on port " + 3000)
})
require('./routes/chatRoutes')(app);
require('./routes/pages')(app);
require('./routes/tokensRoutes')(app);
require('./routes/usersRoutes')(app);
require('./routes/randomStuff')(app);


