var express = require('express');
var router = express.Router();
var auth = require('../../auth/firebaseAuth');

var regionController = require('./Controller');

router.use(auth.restAuth);
router.get('/', regionController.regionList);
router.get('/:regionId', regionController.regionDetail);
router.patch('/:regionId', regionController.updateRegion);

module.exports = router;