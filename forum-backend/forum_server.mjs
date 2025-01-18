import { createServer, get } from "node:http";
import serveStatic from "serve-static";
import { json as readJSON } from "node:stream/consumers";
import connectToDB from "./mongo.mjs";

function notFound(request, response) {
  response.writeHead(404, "Not found");
  response.end("<h1>Not found</h1>");
}

class ForumServer {
  constructor(talks) {
    this.talks = talks;
    this.version = 0;
    this.waiting = [];

    let fileServer = serveStatic("./public");
    this.server = createServer((request, response) => {
      serveFromRouter(this, request, response, () => {
        fileServer(request, response, () => notFound(request, response));
      });
    });
  }
  start(port) {
    this.server.listen(port);
  }
  stop() {
    this.server.close();
  }
}

import { Router } from "./router.mjs";

const router = new Router();
const defaultHeaders = { "Content-Type": "text/plain" };

async function serveFromRouter(server, request, response, next) {
  let resolved = await router.resolve(request, server).catch((error) => {
    if (error.status != null) return error;
    return { body: String(error), status: 500 };
  });
  if (!resolved) return next();
  let { body, status = 200, headers = defaultHeaders } = await resolved;
  response.writeHead(status, {
    ...headers,
    "Access-Control-Allow-Origin": "*", // Allow React app origin
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", // Allow the selected methods
    "Access-Control-Allow-Headers": "*", // Allow all headers
    "Access-Control-Expose-Headers": Object.keys(headers).join(", ") // Allow all headers in the response to be visible
  });
  response.end(body);
}

const talkPath = /^\/talks\/([^\/]+)$/;

router.add("GET", talkPath, async (server, title) => {
  if (Object.hasOwn(server.talks, title)) {
    return {
      body: JSON.stringify(server.talks[title]),
      headers: { "Content-Type": "application/json" },
    };
  } else {
    return { status: 404, body: `No talk '${title}' found` };
  }
});

router.add("DELETE", talkPath, async (server, title) => {
  if (Object.hasOwn(server.talks, title)) {
    const db = await connectToDB();
    await db.collection("talks").deleteOne({ title });
    // Delete related comments
    await db.collection("comments").deleteMany({ talk_title: title });

    server.updated();
  }
  return { status: 204 };
});

router.add("PUT", talkPath, async (server, title, request) => {
  const talk = await readJSON(request);
  if (
    !talk ||
    typeof talk.presenter !== "string" ||
    typeof talk.summary !== "string"
  ) {
    return { status: 400, body: "Bad talk data" };
  }
  const db = await connectToDB();
  await db
    .collection("talks")
    .updateOne(
      { title },
      { $set: { title, presenter: talk.presenter, summary: talk.summary } },
      { upsert: true }
    );
  server.updated();
  return { status: 204 };
});

router.add(
  "POST",
  /^\/talks\/([^\/]+)\/comments$/,
  async (server, title, request) => {
    const comment = await readJSON(request);
    if (
      !comment ||
      typeof comment.author !== "string" ||
      typeof comment.message !== "string"
    ) {
      return { status: 400, body: "Bad comment data" };
    }
    if (comment.message.trim() === "") {
      return { status: 204 };
    }
    const db = await connectToDB();
    await db.collection("comments").insertOne({
      talk_title: title,
      author: comment.author,
      message: comment.message,
    });
    server.updated();
    return { status: 204 };
  }
);

router.add("OPTIONS", /.*/, async () => {
  return {
    status: 204,
    headers: {},
    body: "",
  };
});


ForumServer.prototype.talkResponse = function () {
  let talks = Object.keys(this.talks).map((title) => this.talks[title]);
  return {
    body: JSON.stringify(talks),
    headers: {
      "Content-Type": "application/json",
      "ETag": `"${this.version}"`,
      "Cache-Control": "no-store",
    },
  };
};

router.add("GET", /^\/talks$/, async (server, request) => {
  let tag = /"(.*)"/.exec(request.headers["if-none-match"]);
  let wait = /\bwait=(\d+)/.exec(request.headers["prefer"]);
  // If the client wants to get the talks resources immediately, they can leave out the ETag header
  if (!tag || tag[1] != server.version) {
    return server.talkResponse();
  } else if (!wait) {
    return { status: 304 };
  } else {
    // potentially add an await before this
    return server.waitForChanges(Number(wait[1]));
  }
});

ForumServer.prototype.waitForChanges = function (time) {
  return new Promise((resolve) => {
    this.waiting.push(resolve);
    setTimeout(() => {
      if (!this.waiting.includes(resolve)) return;
      this.waiting = this.waiting.filter((r) => r != resolve);
      resolve({ status: 304 });
    }, time * 1000);
  });
};

async function getTalks() {
  const db = await connectToDB();
  const talks = await db.collection("talks").find().toArray();
  const comments = await db.collection("comments").find().toArray();

  return talks.reduce((acc, talk) => {
    acc[talk.title] = {
      ...talk,
      comments: comments.filter((c) => c.talk_title === talk.title),
    };
    return acc;
  }, {});
}

ForumServer.prototype.updated = async function () {
  this.version++;

  // Fetch talks from the database again to reflect the changes
  await getTalks().then((talks) => {
    this.talks = talks;
  });

  let response = this.talkResponse();
  this.waiting.forEach((resolve) => resolve(response));
  this.waiting = [];
};

getTalks().then((talks) => {
  new ForumServer(talks).start(8000);
  console.log("Forum server started on port 8000");
});
