const mongoose = require("mongoose");
const { utcDefault } = require("../configs");
const Schema = mongoose.Schema;

const usersSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,unique:true
  },
  phone: {
    type: String,
  },
  address: {
    type: String,
  },
  createdBy: { type: Schema.Types.ObjectId, ref: "users" },
  created_At: { type: Date, default: utcDefault },
  updatedBy: { type: Schema.Types.ObjectId, ref: "users" },
  updated_At: { type: Date, default: utcDefault },
  deletedBy: { type: Schema.Types.ObjectId, ref: "users" },
  isDeleted: { type: Boolean, default: false },
});

module.exports = mongoose.model("users", usersSchema);