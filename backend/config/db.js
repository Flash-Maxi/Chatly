import mongoose from "mongoose";

const connectDb = async () => {
    try {

        const conn = await mongoose.connect(process.env.MONGODB_URL);

        console.log("Mongo Connected");
        console.log("Database:", conn.connection.name);
        console.log("Host:", conn.connection.host);
        console.log("Ready State:", mongoose.connection.readyState);

    } catch (err) {

        console.error(err);

    }

    mongoose.connection.on("disconnected", () => {
        console.log("Mongo disconnected");
    });

    mongoose.connection.on("error", err => {
        console.log("Mongo Error:", err);
    });
};

export default connectDb;