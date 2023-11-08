const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required for a message'],
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver is required for a message'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
    },
  },
  { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);
