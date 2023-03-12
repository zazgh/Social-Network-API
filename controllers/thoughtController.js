const { ObjectId } = require("mongoose").Types;
const { Thought, User } = require("../models");


const thoughtCount = async () =>
    
    //.then((result) => result[0]. numberOfThought);

    Thought.aggregate([{ $count: 'numberOfThought' }])
    .then((result) => result[0] ? result[0].numberOfThought : 0);


const singleThoughtCount = async (thoughtId) =>
  Thought.aggregate([
    
    { $match: { _id: thoughtId } },
    
    {
      $unwind: '$reaction',
    },
    {
      
      $count: 'numberOfReactions'
    },
    
  ])
  .then((result) => result[0].numberOfReactions);

module.exports = {
  getThoughts(req, res) {
    Thought.find()
      .then(async (thoughts) => {
        const thoughtObj = {
          thoughts,
          thoughtCount: await thoughtCount(),
        };
        return res.json(thoughtObj);
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json(err);
      });
  },
  // Get a single Thought
  getSingleThought(req, res) {
    Thought.findOne({ _id: req.params.thoughtId })
      .select("-__v")
      .lean()
      .then(async (thought) =>
        !thought
          ? res.status(404).json({ message: "No thought with that ID" })
          : res.json({
              thought
            })
      )
      .catch((err) => {
        console.log(err);
        return res.status(500).json(err);
      });
  },
  // create a new Thought
  createThought(req, res) {
    Thought.create(req.body)
    .then((thought) => 
    {
      User.findOneAndUpdate(
        { _id: req.body.userId },
        { $addToSet: { thought: thought._id } },
        { runValidators: true, new: true }
      ).then(_ => res.json(thought));
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json(err);
    });
    
    
    
    //.catch((err) => res.status(500).json(err));
  },

  deleteThought(req, res) {
    Thought.findOneAndRemove({ _id: req.params.thoughtId })
      .then((thought) =>
        !thought
          ? res.status(404).json({ message: "No such Thought exists" })
          : User.findOneAndUpdate(
              { username: thought.username },
              { $pull: { thought: req.params.thoughtId } },
              { new: true }
            )
            .then((user) =>
              !user
                ? res.status(404).json({
                    message: "thought deleted, but no user found",
                  })
                : res.json({ message: "thought successfully deleted" })
            )
      )
      
      .catch((err) => {
        console.log(err);
        res.status(500).json(err);
      });
  },

  deleteAllThoughts(req, res) {
    Thought.deleteMany()
      .then((thought) =>
        !thought
          ? res.status(404).json({ message: "No such Thought exists" })
          : User.findOneAndUpdate(
              { username: thought.username },
              { $pull: { thought: req.params.thoughtId } },
              { new: true }
            )
            .then((user) =>
              !user
                ? res.status(404).json({
                    message: "thought deleted, but no user found",
                  })
                : res.json({ message: "thoughts successfully deleted" })
            )
      )
      
      .catch((err) => {
        console.log(err);
        res.status(500).json(err);
      });
  },

  addReaction(req, res) {
    console.log("You are adding a reaction");
    console.log(req.body);
    Thought.findOneAndUpdate(
      { _id: req.params.thoughtId },
      { $addToSet: { reaction: req.body } },
      { runValidators: true, new: true }
    )
      .then((thought) =>
        !thought
          ? res
              .status(404)
              .json({ message: "No thought found with that ID :(" })
          : res.json(thought)
      )
      .catch((err) => res.status(500).json(err));
  },
  
  removeReaction(req, res) {
    Thought.findOneAndUpdate(
      { _id: req.params.thoughtId },
      { $pull: { reaction: { reactionId: req.params.reactionId } } },
      { runValidators: true, new: true }
    )
      .then((thought) =>
        !thought
          ? res
              .status(404)
              .json({ message: "No thought found with that ID :(" })
            : res.json({ message: "reaction successfully deleted" })
      )
      .catch((err) => res.status(500).json(err));
  },

  updateThought(req, res) {
    Thought.findOneAndUpdate(
      { _id: req.params.thoughtId },
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
};

/*const { User, Thought} = require('../models');

const thoughtController = {
    getAllThought(req,res) {
        Thought.find({})
        .populate({
            path: 'reactions',
            select: '-__v'
        })
        .select('-__v')
        .sort({_id: -1})
        .then(Thoughtdb => res.json(Thoughtdb))
        .catch(err => {
            console.log (err);
            res.sendStatus(400);
        });
    },

    getThoughtById({ params}, res) {
        Thought.findOne ({_id: params.id})
        .populate({
            path: 'reactions',
            select: '-__v'
        })
        .select('-__v')
        .sort({ _id: -1 })
        .then(Thoughtdb => {
            if (!Thoughtdb) {
                res.status(400).json({ message: 'Id not founded'});
                return;
            }
            res.json(Thoughtdb);
        })
        .catch(err => {
            console.log(err);
            res.sendStatus(400);
        });
    },

    createThought(req, res) {
        Thought.create(req.body)
          .then((Thought) => res.json(Thought))
          .catch((err) => {
            console.log(err);
            return res.status(500).json(err);
          })
               .then(Thoughtdb => {
            if (!Thoughtdb) {
                res.status(400).json({ message: 'User not found with id'});
                return;
            }
            res.json(Thoughtdb);
          }) 
          .catch(err => res.json(err));
      },

      updateThought({ params, body}, res) {
        Thought.findOneAndUpdate({_id: params.id})
        .then(Thoughtdb =>{
            if (!Thoughtdb) {
                res.status(400).json({ message: 'nothing found with id'});
                return;
            }
            return User.findOneAndUpdate(
                {_id: params.userId},
                { $set: req.body },
                { runValidators: true, new: true }
            )
        })
        .then(Thoughtdb =>{
            if (!Thoughtdb) {
                res.status(400).json({ message: 'nothing founded'});
                return;
            }
            res.json(Thoughtdb);
        })
        .catch(err => res.json(err));

      },

      createReaction({params, body}, res) {
        Thought.findOneAndUpdate(
            {}
        )
      }



} */
