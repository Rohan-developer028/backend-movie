require("../configure/config")
const mongoose = require("mongoose");

const MovieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      unique:true
    },
    year: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    genre: {
      type: String,
      required: true,
    },

    poster: {
      type: String, 
      required: false,
    },

    

  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Movie", MovieSchema);
