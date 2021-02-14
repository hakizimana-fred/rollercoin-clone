"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
exports.UserResolver = void 0;
const argon2_1 = __importDefault(require("argon2"));
const validators_1 = require("../utils/validators");
const type_graphql_1 = require("type-graphql");
const User_1 = require("../entity/User");
const apollo_server_express_1 = require("apollo-server-express");
const sendConfirmationEmail_1 = require("../utils/sendConfirmationEmail");
let Inputs = class Inputs {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], Inputs.prototype, "username", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], Inputs.prototype, "email", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], Inputs.prototype, "password", void 0);
Inputs = __decorate([
    type_graphql_1.InputType()
], Inputs);
let UserResolver = class UserResolver {
    helloworld() {
        return 'hello there';
    }
    signup(inputs) {
        return __awaiter(this, void 0, void 0, function* () {
            const { valid, errors } = validators_1.validateSignup(inputs);
            if (!valid)
                throw new apollo_server_express_1.UserInputError('Errors', { errors });
            const userExists = yield User_1.User.findOne({ where: { email: inputs.email } });
            if (userExists) {
                throw new apollo_server_express_1.UserInputError('Username is taken', {
                    errors: {
                        email: 'This username is taken'
                    }
                });
            }
            const hashedPassword = yield argon2_1.default.hash(inputs.password);
            const user = yield User_1.User.create({
                username: inputs.username,
                email: inputs.email,
                password: hashedPassword
            }).save();
            yield sendConfirmationEmail_1.sendConfirmationEmail();
            return user;
        });
    }
    signin(usernameOrEmail, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const { valid, errors } = validators_1.validateSignIn(usernameOrEmail, password);
            if (!valid)
                throw new apollo_server_express_1.UserInputError('UsernameOrEmail', { errors });
            const user = yield User_1.User.findOne(usernameOrEmail.includes('@') ? { where: { email: usernameOrEmail } } : { where: { username: usernameOrEmail } });
            if (!user)
                throw new apollo_server_express_1.UserInputError('user not found', {
                    errors: {
                        global: 'user not found'
                    }
                });
            if (!user)
                return null;
            const validPassword = yield argon2_1.default.verify(user.password, password);
            if (!validPassword)
                throw new apollo_server_express_1.UserInputError('Wrong credentils', {
                    errors: {
                        global: 'Wrong credentails'
                    }
                });
            return user;
        });
    }
};
__decorate([
    type_graphql_1.Query(() => String),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "helloworld", null);
__decorate([
    type_graphql_1.Mutation(() => User_1.User, { nullable: true }),
    __param(0, type_graphql_1.Arg('inputs')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Inputs]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "signup", null);
__decorate([
    type_graphql_1.Mutation(() => User_1.User, { nullable: true }),
    __param(0, type_graphql_1.Arg('usernameOrEmail')),
    __param(1, type_graphql_1.Arg('password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "signin", null);
UserResolver = __decorate([
    type_graphql_1.Resolver()
], UserResolver);
exports.UserResolver = UserResolver;
//# sourceMappingURL=userResolver.js.map