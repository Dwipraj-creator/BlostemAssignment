const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

const apiRouter = require("./routes");
app.use("/api", apiRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
