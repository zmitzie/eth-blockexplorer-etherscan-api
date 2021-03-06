if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const express = require('express');
const bodyParser = require('body-parser');
const routes = require("./routes/routes.js");
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
var multer = require('multer');
var upload = multer();

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(cookieParser());
app.use(routes);

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 
//form-urlencoded

// for parsing multipart/form-data
app.use(upload.array()); 
app.use(express.static('public'));

app.use((req, res, next) => {
    res.status(404).send('<h1>Page not found</h1>');
});

app.listen(process.env.PORT);