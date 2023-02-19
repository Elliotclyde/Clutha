import express from "express";
import { clutha } from "./clutha/clutha";
import { Index } from "./view/Index";

const app = express();

app.use(clutha(app));

app.get("/", async (req, res) => {
  res.clutha(Index, { name: "Hugh" });
});

app.listen(3000);
