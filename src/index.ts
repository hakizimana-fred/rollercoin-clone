import "reflect-metadata";
import { createConnection } from "typeorm";
import { buildSchema } from 'type-graphql'
import { User } from "./entity/User";
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { UserResolver } from './resolvers/userResolver'
import path from 'path'

const startServer = async () => {
    await createConnection({
        type: 'postgres',
        logging: true,
        synchronize: true,
        username: 'postgres',
        password: 'studio',
        database: 'rollercoin',
        port: 5432,
        entities: [User],
        migrations: [path.join(__dirname, './migrations/*')]

    })
    const server = new ApolloServer({
        schema: await buildSchema({
            resolvers: [UserResolver],
            validate: false
        })
    });

    const app = express();
    server.applyMiddleware({ app });

    app.listen({ port: 4000 }, () =>
        console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
    );
}

startServer().catch(err => console.log(err))

