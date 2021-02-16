import "reflect-metadata";
import { createConnection } from "typeorm";
import { buildSchema } from 'type-graphql'
import { User } from "./entity/User";
import express, { Request, Response } from 'express'
import { ApolloServer } from 'apollo-server-express'
import { UserResolver } from './resolvers/userResolver'
import path from 'path'
import dotenv from "dotenv";
import Redis from 'ioredis'
import passport from 'passport'
import "./config/passport"

dotenv.config()

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

    const redis = new Redis()

    const server = new ApolloServer({
        schema: await buildSchema({
            resolvers: [UserResolver],
            validate: false
        }),
        context: ({ req, res }) => ({ req, res, redis })
    });

    const app = express();
    const port = process.env.PORT || 4000


    app.get('/auth/google', passport.authenticate('google', {
        scope: ['profile']
    }))

    app.get('/auth/google/logout', (req: Request, res: Response) => {
        console.log('logging out')
    })

    app.get('/auth/google/callback', (req: Request, res: Response) => {
        console.log('callback url')
    })


    server.applyMiddleware({ app });

    app.listen({ port }, () =>
        console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
    );
}

startServer().catch(err => console.log(err))

