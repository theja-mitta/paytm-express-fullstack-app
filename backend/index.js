const express = require("express");
const cors = require("cors");
const rootRouter = require("./routes/index");
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use("/api/v1", rootRouter);

app.listen(PORT, function(err) {
    if (err) console.log(err);
    console.log("server running on port ", PORT);
});