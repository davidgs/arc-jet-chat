# Chatbot server

This is the server for the chatbot. It is a simple REST API that can be used to send and receive messages from the chatbot.

It supports the following endpoints:
- `POST /chat`: Send a message to the chatbot
- `POST /reset`: Reset the chatbot and erase chat history

The server expects messages to be in the following format:
```json
{
  "message": "Hello, chatbot!"
}
```

There is little error checking in the server, so it is expected that the chat application will handle any errors that occur.

Server is written in Typescript and uses Express.js for the REST API.

## Running the server

To run the server, you need to have Node.js installed. Then you can run the following commands:

```bash
export ARCJET_KEY=your-arcjet-key
export OPENAI_API_KEY=your-openai-api-key
yarn
yarn start
```
If you don't have `yarn` installed, you can use `npm` instead:

```bash
export ARCJET_KEY=your-arcjet-key
export OPENAI_API_KEY=your-openai-api-key
npm install
npm start
```

The server will start on port `4567` by default. You can change the port by setting the `PORT` environment variable.

If you'd like to see all the gory details of the ArcJet API, you can set the `ARCJET_LOG_LEVEL` environment variable to `DEBUG`.

The server will listen for messages from the chat application and send them to the chatbot. It will then return the response from the chatbot to the chat application.

As per the [OPENAI docs](https://platform.openai.com/docs/guides/text-generation?lang=node.js), it keeps a record of the chat history in order to facilitate a 'conversation'. It can reset the conversation when the `/reset` endpoint is called.

## Served content

The server also serves the static files for the chat application. The chat application is a simple React app that sends messages to the server and displays the responses from the chatbot.

See the README in the `client` directory for more information on the chat application.

**Note:** You must run `yarn && yarn build` in the `client` directory before running the server in production mode. This will build the chat application and place the static files in the `server/public` directory. The server will then serve these files when it receives requests to the root URL.