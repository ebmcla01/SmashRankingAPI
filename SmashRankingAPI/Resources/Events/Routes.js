var express = require('express');
var router = express.Router();
var auth = require('../../auth/firebaseAuth');
var eventController = require('./Controller');
var validation = require('../Validation');

router.use(auth.restAuth);
router.get('/', eventController.eventList);
router.post('/',
            validation.validate('createEvent'),
            validation.checkValidation,
            eventController.createEvent);
router.get('/:eventId', eventController.eventDetail);
router.delete('/:eventId', eventController.deleteEvent);
router.patch('/:eventId', eventController.updateEvent);
router.post('/:eventId/SignIn', eventController.signIn);

module.exports = router;