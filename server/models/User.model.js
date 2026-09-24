import mongoose from "mongoose";
import fs from "fs";
import path from "path";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// Fallback JSON DB helper for when MongoDB is disconnected
const getFilePath = () => path.resolve("users.json");

const readData = () => {
  try {
    const filePath = getFilePath();
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    console.error("Failed to read users JSON fallback:", error);
    return [];
  }
};

const writeData = (data) => {
  try {
    fs.writeFileSync(getFilePath(), JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Failed to write users JSON fallback:", error);
  }
};

const createMockInstance = (data) => ({
  ...data,
  toObject() {
    return this;
  },
});

const MockUser = {
  create: async (data) => {
    const list = readData();
    const newUser = {
      _id: Math.random().toString(36).substr(2, 9),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.push(newUser);
    writeData(list);
    return createMockInstance(newUser);
  },
  findOne: async (query) => {
    const list = readData();
    let found = null;
    if (query.email) {
      found = list.find((u) => u.email.toLowerCase() === query.email.toLowerCase());
    } else if (query._id) {
      found = list.find((u) => u._id === query._id);
    }
    return found ? createMockInstance(found) : null;
  },
  findById: async (id) => {
    const list = readData();
    const found = list.find((u) => u._id === id);
    return found ? createMockInstance(found) : null;
  },
};

const MongooseUser = mongoose.model("User", userSchema);

const User = new Proxy(MongooseUser, {
  get(target, prop) {
    const isConnected = mongoose.connection.readyState === 1;
    const source = isConnected ? target : MockUser;
    const value = Reflect.get(source, prop);
    if (typeof value === "function") {
      return value.bind(source);
    }
    return value;
  },
});

export default User;
