import express from "express";
import { render } from "@jaredpalmer/after";
import routes from "./routes";

import MyDocument from "./Document";

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST);
const cookiesMiddleware = require("universal-cookie-express");

const server = express();
server
  .disable("x-powered-by")
  .use(cookiesMiddleware())

  .use(express.static(process.env.RAZZLE_PUBLIC_DIR))
  .get("/*", async (req, res) => {
    let feedUrls = req.universalCookies.get("feedUrls");

    if (!feedUrls) {
      feedUrls = "https://css-tricks.com/feed";
      req.universalCookies.set("feedUrls", feedUrls);
    }

    try {
      const html = await render({
        req,
        res,
        document: MyDocument,
        routes,
        assets,
        feedUrls
      });
      res.send(html);
    } catch (error) {
      res.json(error);
    }
  });

export default server;
