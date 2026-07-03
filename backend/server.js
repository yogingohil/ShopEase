require("dotenv").config();
const connectDB = require("./config/db");
const app = require("./app");

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`ShopEase API running at http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error("Unable to start the server. Check your MongoDB connection.");
  console.error(error.message);
  process.exit(1);
});
