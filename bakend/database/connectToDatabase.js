import mongoose from "mongoose";

 const connectToDatabase = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.log(`Error connecting to MongoDB: ${error.message}`);
  }
};

export default connectToDatabase;