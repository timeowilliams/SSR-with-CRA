// server/server.js
import express from "express";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import App from "../src/App";
import { Transform } from 'stream';

const app = express();

app.get("/*", (req, res) => {
  const entryPoint = ["/main.js"];

  
  const logStream = new Transform({
    transform(chunk, encoding, callback) {
      console.log(chunk.toString()); // Log the chunk to the console
      this.push(chunk); // Pass the chunk along
      callback();
    }
  });

  const { pipe, abort: _abort } = ReactDOMServer.renderToPipeableStream(
    <StaticRouter location={req.url}>
      <App />
    </StaticRouter>,
    {
      bootstrapScripts: entryPoint,
      onShellReady() {
        res.statusCode = 200;
        res.setHeader("Content-type", "text/html");
        pipe(logStream).pipe(res);
      },
      onShellError() {
        res.statusCode = 500;
        res.send("<!doctype html><p>Loading...</p>");
      },
    }
  );
});

app.listen(3002, () => {
  console.log("App is running on http://localhost:3002");
});