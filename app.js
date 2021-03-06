//dependencies
let express = require("express"); //use to create server
let fs = require("fs"); //use to read file
let multer = require("multer"); //use to upload files
let { createWorker } = require("tesseract.js"); //use to read images
let app = express();
//storage setup
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
})
let upload = multer({storage: storage}).single("abdullah"); //here setting up upload

//setting up front end
app.set("view engine", "ejs");

//server start up
let PORT = 30 // if we run this live we have to use environment var
app.listen(PORT, console.log("Server is running successfully"));

//routes
app.get("/", (req, res, next) => {
    res.render("index");
})
app.post("/upload", (req, res) => {
    upload(req, res, (err) => {
        (async () => {
            const worker = createWorker({
                logger: m => console.log(m)
            });
            await worker.load();
            await worker.loadLanguage('eng');
            await worker.initialize('eng');
            const { data: { text } } = await worker.recognize(`./uploads/${req.file.originalname}`);
            console.log(text);
            const { data } = await worker.getPDF('OCR Result');
            fs.writeFileSync('ocr-result.pdf', Buffer.from(data));
            console.log('PDF generated: ocr-result.pdf');
            res.redirect("/download");
            await worker.terminate();
        })();
    });
});
app.get("/download", (req, res) => {
    const file = `${__dirname}/ocr-result.pdf`;
    res.sendFile(file);
});
