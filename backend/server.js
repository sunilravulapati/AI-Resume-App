import exp from 'express'
import cors from 'cors'
import { connect } from 'mongoose'
import { config } from 'dotenv'
import cookieParser from 'cookie-parser'
import {resumeRouter} from './apis/resume.js';
import {userRouter} from './apis/user.js'
config()

const app = exp()

app.use(cors({ origin: ["http://localhost:5173"],credentials:true }));
app.use(exp.json());
app.use(cookieParser());
app.use("/api/resume", resumeRouter);
app.use("/api/user", userRouter);

const connectDB = async () => {
    try{
        await connect(process.env.DB_URL)
        console.log("DB connection success!")
        app.listen(process.env.PORT, () => console.log("server started!"))
    }
    catch(err){
        console.log("error occurred!")
    }
}
connectDB()

//test
app.get("/users",async (req,res) => {
    console.log("success!")
    res.status(200).json({message:"success!"})
})


//dealing with invalid paths
app.use((req, res, next) => {
    return res.json({ message: `${req.url} is an invalid path` })
})

//error handling middleware
app.use((err, req, res, next) => {

    console.log("Error name:", err.name);
    console.log("Error code:", err.code);
    console.log("Full error:", err);

    // mongoose validation error
    if (err.name === "ValidationError") {
        return res.status(400).json({
            message: "error occurred",
            error: err.message,
        });
    }

    // mongoose cast error
    if (err.name === "CastError") {
        return res.status(400).json({
            message: "error occurred",
            error: err.message,
        });
    }

    const errCode = err.code ?? err.cause?.code ?? err.errorResponse?.code;
    const keyValue = err.keyValue ?? err.cause?.keyValue ?? err.errorResponse?.keyValue;

    if (errCode === 11000) {
        const field = Object.keys(keyValue)[0];
        const value = keyValue[field];
        return res.status(409).json({
            message: "error occurred",
            error: `${ field } "${value}" already exists`,
        });
    }
    // ✅ HANDLE CUSTOM ERRORS
    if (err.status) {
        return res.status(err.status).json({
            message: "error occurred",
            error: err.message,
        });
    }
    // default server error
    res.status(500).json({
        message: "error occurred",
        error: "Server side error",
    });
});