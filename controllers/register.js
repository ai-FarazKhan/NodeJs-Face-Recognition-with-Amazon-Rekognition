const path = require('path');

exports.register = (req, res) => {

    if (!req.files) {
        return res.status(400).json({
            success: false,
            message: "Please Upload a file !!"
        })
    }

    const file = req.files.file;

    if (!file.mimetype.startsWith('image')) {
        return res.status(400).json({
            success: false,
            message: "Please upload an image file !!!"
        })
    }

    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return res.status(400).json({
            success: false,
            message: `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`
        })
    }

    file.name = `photo_${path.parse(file.name).ext}`;

    // Now ab upload karnay time agaya hai file ko.
    file.mv(`${process.env.FILE_REGISTER_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Problem with file upload !!"
            });
        }

        // and then simply send back our response.
        await res.status(200).json({
            success: true,
            data: file.name
        });
    });

    
};
