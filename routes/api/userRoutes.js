const router = require('express').Router();
const {
  getUsers,
  getSingleUser,
  createUser,
  updateUser,
  deleteUser,
  createFriend,
  removeFriend,
  deleteAllUsers
} = require('../../controllers/userController.js');

router.route('/').get(getUsers).post(createUser).delete(deleteAllUsers);


router.route('/:userId').get(getSingleUser).put(updateUser).delete(deleteUser);

router
  .route('/:userId/friends/:friendId')
  .post(createFriend);
 

router
  .route('/:userId/friends/:friendId')
  .delete(removeFriend);

module.exports = router;
