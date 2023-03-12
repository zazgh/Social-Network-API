const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongoose").Types;
const { User, Thought } = require("../models");

module.exports = {
  getUsers(req, res) {
    User.find()
      .populate("thought")
      .populate("friends")
      .then(async (users) => {
        const userObj = {
          users,
          userCount: users.length,
        };
        return res.json(userObj);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ msg: "error!", err });
      });
  },

  getSingleUser(req, res) {
    User.findOne({ _id: req.params.userId })
      .populate("thought")
      .populate("friends")
      .select("-__v")
      .then((user) =>
        !user
          ? res.status(404).json({ message: "No user with that ID" })
          : res.json(user)
      );

    //.catch((err) => res.status(200).json(err));
  },

  createUser(req, res) {
    User.create(req.body)
      .then((user) => res.json(user))
      .catch((err) => {
        console.log(err);
        return res.status(500).json(err);
      });
  },

  deleteUser(req, res) {
    User.findOneAndDelete({ _id: req.params.userId })
      .then((user) => {
        try {
          if (!user) {
            res.status(404).json({ message: "No user with that ID" });
          } else {
            Thought.deleteMany({ _id: { $in: user.thought } });
            res.json({ message: "user and thought deleted!" });
          }
        } catch (e) {
          console.log("error" + e);
        }
      })
      //.then(() => res.json({ message: "user and thought deleted!" }))
      .catch((err) => res.status(500).json(err));
  },

  deleteAllUsers(req, res) {
    User.deleteMany()
      .then((user) => {
        try {
          if (!user) {
            res.status(404).json({ message: "No user with that ID" });
          } else {
            Thought.deleteMany();
            res.json({ message: "users and thoughts deleted!" });
          }
        } catch (e) {
          console.log("error" + e);
        }
      })
      //.then(() => res.json({ message: "user and thought deleted!" }))
      .catch((err) => res.status(500).json(err));
  },

  updateUser(req, res) {
    User.findOneAndUpdate(
      { _id: req.params.userId },
      { $set: req.body },
      { runValidators: true, new: true }
    )
      .then((user) =>
        !user
          ? res.status(404).json({ message: "No user with this id!" })
          : res.json(user)
      )
      .catch((err) => res.status(500).json(err));
  },

  createFriend(req, res) {
    console.log("looking for " + req.params.userId);
    User.findOneAndUpdate(
      { _id: req.params.userId },
      { $addToSet: { friends: ObjectId(req.params.friendId) } },
      { runValidators: true, new: true }
    )
      .then((user) =>
        !user
          ? res.status(404).json({ message: "No user with this id!" })
          : user
      )
      .then(() => {
        console.log("looking for " + req.params.friendId);
        User.findOneAndUpdate(
          { _id: req.params.friendId },
          { $addToSet: { friends: ObjectId(req.params.userId) } },
          { runValidators: true, new: true }
        )
          .then((user) =>
            !user
              ? res
                  .status(404)
                  .json({
                    message: `No second user with id ${req.params.friendId}`,
                  })
              : res.json(user)
          )
          .catch((err) => res.status(500).json(err));
      })
      .catch((err) => res.status(500).json(err));
  },
  removeFriend(req, res) {
    User.findOneAndUpdate(
      { _id: req.params.userId },
      { $pull: { friends: req.params.friendId } },
      { runValidators: true, new: true }
    )
      .then((user) =>
        !user
          ? res.status(404).json({ message: "No user with this id!" })
          : res.json(user)
      )
      .catch((err) => res.status(500).json(err));
  },
};
