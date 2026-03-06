import dotenv from "dotenv";
import express from "express"
import cors from "cors";
import connectDB from "./config/connectDB.js";
import router from "./routes/authRoutes.js";
import songRouter from "./routes/songRoutes.js";

dotenv.config();
const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());

//Connect your DataBase
connectDB();

app.use(
    cors({
        origin: "*",
        credentials: true,
    })
);
app.get("/api",(req, res) => {
    res.status(200).json({message: "Server is working"});
});

app.use("/api/auth",router);
app.use("/api/songs",songRouter);

app.listen(PORT, () => console.log(`Server is running on Port ${PORT}`));
