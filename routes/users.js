const  express = require('express');
const  router = express.Router();
const   nsfwjs = require('@tensorflow-models/coco-ssd');
const { Image, createCanvas } = require('canvas');
let model;

async function loadModel(){
  model = await nsfwjs.load();
  console.log("Model loaded")
}
loadModel();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/detect-objects',async (req,res)=>{

    // feed images
    const width = 300;

    const height = 300;

    const canvas = createCanvas(width, height);

    const ctx = canvas.getContext('2d');

    const img = new Image();

    img.onload = async function(){

        const resolution = img.width +'x'+ img.height;

        ctx.drawImage(img, 0, 0, width, height);
        
        const predictions = await model.detect(canvas);
        // Classify the image
        res.send({'object':predictions,resolution});
    }
    img.onerror = err => { throw err }
    img.src = req.body.img;

    /* 
    let rQImage = req.files.img;
    const fileSizeInBytes=rQImage.size;
    const fileType = rQImage.mimetype;
    console.table({fileSizeInBytes,fileType}) */

})
module.exports = router;
