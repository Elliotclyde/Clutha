import * as ReactDomServer from "react-dom/server";
import React from "react";
import * as fs from "fs";
import { LiveReloadClient } from "./LiveReloadClient";

const isDev = true;

function clutha(app) {
  fileWatch("./", () => {
    while (reloadClients.length > 0) {
      sendMessage(reloadClients.pop(), "message", "reload");
    }
  });

  app.get("/livereload", (req, res) => {
    startLiveReloadConnection(res);
  });

  return async function (req, res, next) {
    res.clutha = async function (Component, props) {
      const { pipe, abort } = await ReactDomServer.renderToPipeableStream(
        React.createElement(
          isDev
            ? () =>
                React.createElement(
                  LiveReloadClient,
                  null,
                  React.createElement(Component, props)
                )
            : () => React.createElement(Component, props)
        )
      );
      pipe(res);
    };
    next();
  };
}

const reloadClients = [];

function startLiveReloadConnection(res) {
  res.writeHead(200, {
    connection: "keep-alive",
    "content-type": "text/event-stream",
    "cache-control": "no-cache",
  });

  sendMessage(res, "connected", "ready");
  setInterval(sendMessage, 60000, res, "ping", "waiting");
  reloadClients.push(res);
}

function sendMessage(res, channel, data) {
  res.write(`event:${channel}\nid: 0\ndata:${data}`);
  res.write(`\n\n`);
}

const fileWatch =
  process.platform !== "linux"
    ? (x, callBack) => {
        fs.watch(x, { recursive: true }, callBack);
      }
    : (x, callBack) => {
        fs.watch(x, callBack);
        if (fs.statSync(x).isDirectory()) {
          fs.readdirSync(x).forEach((xx) => fileWatch(`${x}:/${xx}`, cb));
        }
      };

export { clutha };
