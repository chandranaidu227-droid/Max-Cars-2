const mongoose = require("mongoose");

const options = { timestamps: true, versionKey: false };

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  phone: { type: String, trim: true, default: "" },
  city: { type: String, trim: true, default: "" },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ["customer", "admin"], default: "customer" },
  active: { type: Boolean, default: true },
}, options);

const vehicleSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  brand: { type: String, required: true, trim: true },
  model: { type: String, required: true, trim: true },
  variant: { type: String, trim: true, default: "" },
  price: { type: Number, required: true, min: 0 },
  fuel: { type: String, trim: true, default: "" },
  body: { type: String, trim: true, default: "" },
  year: Number,
  image: String,
  active: { type: Boolean, default: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, options);

const favouriteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  vehicleId: { type: String, required: true, trim: true },
}, options);
favouriteSchema.index({ user: 1, vehicleId: 1 }, { unique: true });

function ownedSchema(fields) {
  return new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    ...fields,
  }, options);
}

const Booking = mongoose.model("Booking", ownedSchema({
  vehicleId: { type: String, required: true },
  location: { type: String, required: true },
  appointmentAt: { type: Date, required: true },
  status: { type: String, enum: ["requested", "confirmed", "completed", "cancelled"], default: "requested" },
  notes: { type: String, maxlength: 1000, default: "" },
}));

const Order = mongoose.model("Order", ownedSchema({
  reference: { type: String, required: true, unique: true, index: true },
  items: { type: [mongoose.Schema.Types.Mixed], default: [] },
  customer: { type: mongoose.Schema.Types.Mixed, default: {} },
  fulfilment: { type: mongoose.Schema.Types.Mixed, default: {} },
  status: { type: String, default: "dealer-verification-requested" },
  payment: { type: mongoose.Schema.Types.Mixed, default: { mode: "test", collected: false, amount: 0 } },
}));

const Listing = mongoose.model("Listing", ownedSchema({
  registration: { type: String, required: true, trim: true, uppercase: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  year: Number,
  price: { type: Number, min: 0 },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  status: { type: String, enum: ["draft", "pending", "verified", "reserved", "sold"], default: "draft" },
}));

const SupportTicket = mongoose.model("SupportTicket", ownedSchema({
  reference: { type: String, required: true, unique: true, index: true },
  topic: { type: String, required: true },
  subject: { type: String, required: true, maxlength: 200 },
  description: { type: String, required: true, maxlength: 5000 },
  vehicleId: String,
  status: { type: String, enum: ["open", "in-progress", "resolved", "closed"], default: "open" },
}));

module.exports = {
  User: mongoose.model("User", userSchema),
  Vehicle: mongoose.model("Vehicle", vehicleSchema),
  Favourite: mongoose.model("Favourite", favouriteSchema),
  Booking,
  Order,
  Listing,
  SupportTicket,
};
