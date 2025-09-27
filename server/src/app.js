import { app } from "./server";

// Middlewares
import errorHandler from "./middlewares/errorHandler.middleware.js";



app.use(errorHandler);