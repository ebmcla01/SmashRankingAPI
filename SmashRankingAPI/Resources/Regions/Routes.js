var express = require('express');
var router = express.Router();

var regionController = require('./Controller');

router.get('/', regionController.regionList);
router.get('/:regionId', regionController.regionDetail);
router.patch('/:regionId', regionController.updateRegion);

module.exports = router;