import mongoose from "mongoose";

const getModelSafely = (name, schema) => {
  return mongoose.models[name] || mongoose.model(name, schema);
};

export default getModelSafely;
