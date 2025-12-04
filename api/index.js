import dotenv from 'dotenv';
dotenv.config();
import app from '../src/app.js';
import connectDB from '../src/config/database.js';
// Connect to database
connectDB();
export default app;
//# sourceMappingURL=index.js.map