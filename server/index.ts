/* The MIT License (MIT)
 *
 * Copyright (c) 2024-present David G. Simmons
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import arcjet, { rateLimit, createRemoteClient, defaultBaseUrl, detectBot, Arcjet, ArcjetHeaders } from "arcjet";
import { createConnectTransport } from "@connectrpc/connect-node";
import { ChatCompletionMessageParam } from "openai/resources";
import OpenAI from "openai";
import express from "express";
import cors from "cors";

const port = process.env.PORT || 4567;
/**
 * must have a key, or we can't use the API
 * @type {string}
 * @throws {Error} if the key is not found
 **/
const key = process.env.ARCJET_KEY;
if (!key) {
  throw new Error("ARCJET_KEY is required");
}
/**
 * @type {Arcjet}
 */
const aj = arcjet({
  key: key,
  rules: [
    rateLimit({
      mode: "LIVE",
      match: "/chat",
      characteristics: ["ip.src"],
      window: "1h",
      max: 60,
    }),
    detectBot({
      mode: "LIVE",
      block: ["AUTOMATED", "LIKELY_AUTOMATED"],
    }),
  ],
  // rateLimit({
  //   mode: "LIVE",
  //   // Limiting by ip.src is the default if not specified
  //   //characteristics: ["ip.src"],
  //   window: "1h",
  //   max: 60,
  //   timeout: "1h",
  // })
  client: createRemoteClient({
    transport: createConnectTransport({
      baseUrl: defaultBaseUrl(),
      httpVersion: "1.1",
    }),
  }),
});


/**
 * @type {express}
 * @description create an express app
 * @returns {express}
 **/
const app = express();

/**
 * Enable CORS
 * @returns {void}
 * @description Enable CORS
 **/
app.use(cors());

app.use(express.static("public"));
/**
 * Enable JSON parsing
 * @returns {void}
 * @description Enable JSON parsing
 **/
app.use(express.json());

/**
 * @type {OpenAI}
 * @description create an instance of the OpenAI API
 * @returns {OpenAI}
 **/
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * @type {string[]}
 * @description user messages
 **/
let userMessages: string[] = [];

/**
 * @type {string[]}
 * @description chat messages
 **/
let chatMessages: string[] = [];

/**
 * @returns {Promise<string>}
 * @description get the messages from OpenAI
 **/
async function getChatMessages(): Promise<string> {
  // using a sarcastic AI Bot for fun.
  const msgs: ChatCompletionMessageParam[] = [{ role: "system", content: "You are sarcastic, foul-mouthed, and unhelpful." }]
  // Normally I'd use a map here, but I need to keep the order of the messages and correlate the user messages with the chat messages
  for (let i = 0; i < userMessages.length; i++) {
    msgs.push({ role: "user", content: userMessages[i] });
    if (chatMessages[i] !== undefined) {
      msgs.push({ role: "assistant", content: chatMessages[i] });
    }
  }
  const returnMessage = await openai.chat.completions.create({
    messages: msgs,
    model: "gpt-3.5-turbo",
  });
  chatMessages.push(returnMessage.choices[0].message.content as string);
  return returnMessage.choices[0].message.content as string;
}

/**
 * @returns {void}
 * @description reset the chat messages
 **/
app.post("/reset", (req, res) => {
  const h = req.headers;
  userMessages = [];
  chatMessages = [];
  res.writeHead(200);
  res.end("Reset successful");
});

/**
 * @returns {void}
 * @description chat endpoint
 **/
app.post("/chat", (req, res) => {
  switch (req.url) {
    case "/":
      res.writeHead(200);
      res.end("This is not the bot you're looking for");
      break;
    case "/chat":
      const handleChat = async () => {
        // Construct this by hand.
        // if you don't add the headers, rate limit checks will fail.
        const details = {
          ip: req.socket.remoteAddress,
          path: req.url,
          method: req.method,
          host: req.headers.host,
          protocol: req.protocol,
          headers: new ArcjetHeaders(req.headers),
        };
        const decision = await aj.protect(details);
        // Oh good, we are allowed!
        if (decision.isAllowed()) {
          const message = req.body.message;
          userMessages.push(message as string);
          const newResponse = async () => {
            const val = await getChatMessages();
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ data: val }));
          }
          newResponse()
          // No chat for you!
        } else {
          res.writeHead(429, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "No chat for you!" }));
        }
      };
      handleChat();
      break;
    default:
      res.writeHead(404);
      res.end(JSON.stringify({ error: "Resource not found" }));
  }
});

/**
 * @returns {void}
 * @description start the server
 **/
app.listen(port, () => {
  console.log(`Server is running ... got to http://localhost:${4567}/ to chat with the AI`);
}
);

