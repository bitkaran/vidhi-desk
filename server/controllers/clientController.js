const Client = require("../models/Client");
const { success, error } = require("../utils/response");

// ✅ Create Client
exports.createClient = async (req, res) => {
  try {
    const { category, name, phone, email } = req.body;

    if (!name || !phone) {
      return error(res, "Name and Phone are required", 400);
    }

    const client = await Client.create({
      user: req.user._id,
      category,
      name,
      phone,
      email,
    });

    return success(res, { data: client }, "Client created successfully", 201);
  } catch (err) {
    return error(res, err.message);
  }
};

// ✅ Get All Clients
exports.getClients = async (req, res) => {
  try {
    const clients = await Client.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    return success(
      res,
      { count: clients.length, data: clients },
      "Clients fetched successfully"
    );
  } catch (err) {
    return error(res, err.message);
  }
};

// ✅ Get Single Client
exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!client) {
      return error(res, "Client not found", 404);
    }

    return success(res, { data: client }, "Client fetched");
  } catch (err) {
    return error(res, err.message);
  }
};

// ✅ Update Client
exports.updateClient = async (req, res) => {
  try {
    let client = await Client.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!client) {
      return error(res, "Client not found", 404);
    }

    client = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return success(res, { data: client }, "Client updated successfully");
  } catch (err) {
    return error(res, err.message);
  }
};

// ✅ Delete Client
exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!client) {
      return error(res, "Client not found", 404);
    }

    return success(res, {}, "Client deleted successfully");
  } catch (err) {
    return error(res, err.message);
  }
};