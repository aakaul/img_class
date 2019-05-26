const express = require('express');
const router = express.Router();
const coco = require('@tensorflow-models/coco-ssd');
const {
    Image,
    createCanvas
} = require('canvas');
let model;

async function loadModel() {
    model = await coco.load();
    console.log("Model loaded")
}
loadModel();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/detect-objects', async (req, res) => {

  if (req.body.img) {
      // feed images
      const width = 300;

      const height = 300;

      const canvas = createCanvas(width, height);

      const ctx = canvas.getContext('2d');

      const img = new Image();
      img.onload = async function () {

          let resolution = img.width + 'x' + img.height;

          ctx.drawImage(img, 0, 0, width, height);

          let predictions = await model.detect(canvas);

          res.status(200).send({status:'success','object': predictions,resolution});
      }
      img.onerror = err => {
          throw err
      }
      img.src = req.body.img;
      
  }else{
    res.status(400).send({status:'falied',msg:'file doesnt exist'})
  }

})
module.exports = router;
