"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const type_graphql_1 = require("type-graphql");
const User_1 = require("./entity/User");
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const userResolver_1 = require("./resolvers/userResolver");
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const ioredis_1 = __importDefault(require("ioredis"));
const passport_1 = __importDefault(require("passport"));
require("./config/passport");
dotenv_1.default.config();
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    yield typeorm_1.createConnection({
        type: 'postgres',
        logging: true,
        synchronize: true,
        username: 'postgres',
        password: 'studio',
        database: 'rollercoin',
        port: 5432,
        entities: [User_1.User],
        migrations: [path_1.default.join(__dirname, './migrations/*')]
    });
    const redis = new ioredis_1.default();
    const server = new apollo_server_express_1.ApolloServer({
        schema: yield type_graphql_1.buildSchema({
            resolvers: [userResolver_1.UserResolver],
            validate: false
        }),
        context: ({ req, res }) => ({ req, res, redis })
    });
    const app = express_1.default();
    const port = process.env.PORT || 4000;
    app.get('/auth/google', passport_1.default.authenticate('google', {
        scope: ['profile']
    }));
    app.get('/auth/google/logout', (req, res) => {
        console.log('logging out');
    });
    app.get('/auth/google/callback', (req, res) => {
        console.log('callback url');
    });
    server.applyMiddleware({ app });
    app.listen({ port }, () => console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`));
});
startServer().catch(err => console.log(err));
//# sourceMappingURL=index.js.map