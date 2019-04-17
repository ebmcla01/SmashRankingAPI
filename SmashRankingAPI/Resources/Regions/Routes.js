var express = require('express');
var router = express.Router();

var regionController = require('./Controller');

router.get('/', regionController.regionList);
router.post('/', regionController.createRegion);
router.get('/:regionId', regionController.regionDetail);
router.delete('/:regionId', regionController.deleteRegion);
router.patch('/:regionId', regionController.updateRegion);

module.exports = router;