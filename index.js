const express = require('express');
require('dotenv').config();
const path = require('path')
const multer = require("multer");
const { s3Uploadv2, s3Uploadv3, s3Deletev2 } = require("./s3");
const {isAuth} = require('./middleware/isAuthenticated')
const colors = require('colors')
const connectDB = require('./config/db')
const cors = require('cors');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./schema/schema');

const port = process.env.PORT || 4000;


const app = express();
app.use(cors());
app.use(bodyParser.json({limit: '30mb', extended: true}));
app.use(bodyParser.urlencoded({limit: '30mb', extended: true}));
app.use(isAuth)
connectDB();


app.use('/graphql', graphqlHTTP({
 schema,
 graphiql: process.env.NODE_ENV ==='development',
}))

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[0] === "image") {
    cb(null, true);
  } else {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
  }
};


const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1000000000, files: 2 },
});

app.post("/upload", upload.array("file"), async (req, res) => {
  try {
    const results = await s3Uploadv2(req.files);
    if(results){
      res.send({name: results[0].Key, location:results[0].Location});
    }
  } catch (err) {
    console.log(err);
  }
});

app.delete('/delete/:fileName', async (req, res)=>{
  const fileName = req.params.fileName
  try {
    await s3Deletev2(fileName)
 res.send(fileName)
  } catch (error) {
    console.log(error);
  }
})


app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "file is too large",
      });
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        message: "File limit reached",
      });
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        message: "File must be an image",
      });
    }
  }
});

app.get('/read', (req, res)=>{
  res.send('server is running')
})


app.listen(port, console.log(`Server running on port: ${port}`))