var express = require('express');
var router = express.Router();

var userController = require('./Controller');

router.get('/', userController.userList);
router.post('/', userController.createUser);
router.get('/:userId', userController.userDetail);
router.delete('/:userId', userController.deleteUser);
router.patch('/:userId', userController.updateUser);

module.exports = router;