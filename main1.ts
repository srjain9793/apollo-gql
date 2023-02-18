// npm install @apollo/server express graphql cors body-parser
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { App, ExpressReceiver } from '@slack/bolt';
const http = require('http');
// import cors from 'cors';
// import bodyParser from 'body-parser';
// import { typeDefs, resolvers } from './schema';
const typeDefs = `#graphql
type Query {
  hello: String
}
`;
const resolvers = {
    Query: {
        hello: () => 'world',
    },
};

interface MyContext {
    token?: string;
}

const boltApp = new App({
    signingSecret: '82f0e1fe0fa49d6f0feb610ace7ba9fc',
    token: 'xoxb-4457009787666-4450618955654-KtYxZfTkAppt2qjtinPHMbWD',
    endpoints: '/',
    appToken: 'xapp-1-A04D0JKKU23-4450802409238-0e5557c7fde370c4ef678b816bc755bec45ff42dcd759b281d9c2cb50dfab26e'
});

const boltReceiver = new ExpressReceiver({
    signingSecret: '82f0e1fe0fa49d6f0feb610ace7ba9fc',
    // endpoints: '/'
}).app;


// Required logic for integrating with Express
// const expressApp = new ExpressReceiver();
// Our httpServer handles incoming requests to our Express app.
// Below, we tell Apollo Server to "drain" this httpServer,
// enabling our servers to shut down gracefully.
const httpServer = http.createServer(boltReceiver);

// Same ApolloServer initialization as before, plus the drain plugin
// for our httpServer.
const server = new ApolloServer<MyContext>({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

// Set up our Express middleware to handle CORS, body parsing,
// and our expressMiddleware function.


// Modified server startup
new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));
console.log(`🚀 Server ready at http://localhost:4000/`);

(async () => {
    // Ensure we wait for our server to start
    await server.start();
    boltReceiver.use(
        '/',
        // cors<cors.CorsRequest>(),
        // bodyParser.json(),
        // expressMiddleware accepts the same arguments:
        // an Apollo Server instance and optional configuration options
        expressMiddleware(server, {
            context: async ({ req }) => ({ token: req.headers.token }),
        }),
    );

    // Start your app
    await boltApp.start();
    // await boltReceiver.start();

    console.log('⚡️ Bolt app is running!');
})();