const fs = require('fs');
const path = require('path')
const AWS = require('aws-sdk')

exports.login = (req, res) => {

    let countMatches = 0;
    // let holdSimalirty = 0;

    if (!req.files) {
        return res.status(400).json({
            success: false,
            message: "Please Upload a file !!"
        })
    }

    const fileInput = req.files.file;

    if (!fileInput.mimetype.startsWith('image')) {
        console.log("Response 1")
        return res.status(400).json({
            success: false,
            message: "Please upload an image file !!!"
        })
    }

    if (fileInput.size > process.env.MAX_FILE_UPLOAD) {
        console.log("Response 2")
        return res.status(400).json({
            success: false,
            message: `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`
        })
    }

    fileInput.name = `photo_${path.parse(fileInput.name).ext}`;

    // Now ab upload karnay ka time agaya hai file ko.
    fileInput.mv(`${process.env.FILE_LOGIN_UPLOAD_PATH}/${fileInput.name}`, err => {
        if (err) {
            console.log("Response 3")
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Problem with file upload !!"
            });
        }

        const config = new AWS.Config({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION
        })

        const client = new AWS.Rekognition();

        fs.readdirSync("E:\\FaceRekognition In NodeJs\\public\\uploads\\registerUploads\\").forEach((file) => {

            const params = {
                "SourceImage": {
                    "Bytes": fs.readFileSync(`E:\\FaceRekognition In NodeJs\\public\\uploads\\loginUploads\\${fileInput.name}`)
                },
                "TargetImage": {
                    "Bytes": fs.readFileSync(`E:\\FaceRekognition In NodeJs\\public\\uploads\\registerUploads\\${file}`)
                },
                "SimilarityThreshold": 70
            }

            client.compareFaces(params, function (err, response) {
                if (err) {
                    console.log(err, err.stack); // an error occurred
                    return res.status(400).json({ success: false, message: "Error!!" });
                } else {
                    if (response.FaceMatches) {
                        response.FaceMatches.forEach(data => {
                            let position = data.Face.BoundingBox
                            let similarity = data.Similarity
                            console.log(`The face at: ${position.Left}, ${position.Top} matches with ${similarity} % confidence And File name = ${fileInput.name}`)
                            countMatches++;
                        })
                    }
                    if (response.UnmatchedFaces) {
                        response.UnmatchedFaces.forEach(data => {
                            let position = data.BoundingBox
                            let similarity = data.Similarity
                            console.log(`The face at: ${position.Left}, ${position.Top} did not matches with ${similarity || 0} % confidence . And File name = ${file}`)
                        })
                    }
                }
            });

        })
    });

    if (countMatches > 0) {
        return res.status(200).json({ success: true, message: `${countMatches} No: of faces matches !!` });
    }
    else {
        return res.status(200).json({ success: false, message: `${countMatches} No: of faces matches !!` });
    }
}
