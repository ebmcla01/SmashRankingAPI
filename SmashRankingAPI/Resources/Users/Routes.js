var express = require('express');
var router = express.Router();
var auth = require('../../auth/firebaseAuth');

var userController = require('./Controller');
router.use(auth.restAuth);

router.get('/', userController.userList);
router.post('/', userController.createUser);
router.get('/:userId', userController.userDetail);
router.delete('/:userId', userController.deleteUser);
router.patch('/:userId', userController.updateUser);
router.post('/:userId/Rank', userController.createRank);
router.post('/myRank', userController.updateScore);

module.exports = router;