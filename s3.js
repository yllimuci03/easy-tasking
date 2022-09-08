const { S3 } = require("aws-sdk");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const uuid = require("uuid").v4;

const s3 = new S3();
const s3Uploadv2 = async (files) => {

  const params = files.map((file) => {
    return {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${uuid()}-${file.originalname}`,
      Body: file.buffer,
    };
  });

  return await Promise.all(params.map((param) => s3.upload(param).promise()));
};

const s3Deletev2 = async(fileName)=>{
  return await s3.deleteObject({Bucket: process.env.AWS_BUCKET_NAME, Key: fileName}).promise();
  
}

// exports.s3Uploadv3 = async (files) => {
//   const s3client = new S3Client();

//   const params = files.map((file) => {
//     return {
//       Bucket: process.env.AWS_BUCKET_NAME,
//       Key: `uploads/${uuid()}-${file.originalname}`,
//       Body: file.buffer,
//     };
//   });

//   return await Promise.all(
//     params.map((param) => s3client.send(new PutObjectCommand(param)))
//   );
// };

// downloads a file from s3

module.exports={s3Uploadv2, s3Deletev2}
