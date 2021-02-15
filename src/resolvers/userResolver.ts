import argon2 from 'argon2'
import { validateSignIn, validateSignup } from '../utils/validators'
import { Resolver, Mutation, Query, Arg, InputType, Field, Ctx, } from 'type-graphql'
import { User } from '../entity/User'
import { UserInputError, AuthenticationError } from 'apollo-server-express'
import { sendConfirmationEmail } from '../utils/sendConfirmationEmail'
import { sendResetPasswordEmail } from '../utils/sendResetPasswordEmail'
import jwt from 'jsonwebtoken'
import { getConnection } from 'typeorm'
import { createConfirmationUrl } from '../utils/confirmationUrl'
import { v4 } from 'uuid'


@InputType()
class Inputs {
    @Field()
    username: string
    @Field()
    email: string
    @Field()
    password: string
}

@Resolver()
export class UserResolver {
    @Query(() => String)
    helloworld() {
        return 'hello there'
    }

    @Mutation(() => User, { nullable: true })
    async signup(
        @Arg('inputs') inputs: Inputs
    ): Promise<User | null> {
        const { valid, errors } = validateSignup(inputs)

        if (!valid) throw new UserInputError('Errors', { errors })
        const { username, email, password } = inputs

        const userExists = await User.findOne({ where: { email } })

        if (userExists) {
            throw new UserInputError('Username is taken', {
                errors: {
                    email: 'This username is taken'
                }
            })
        }

        const hashedPassword = await argon2.hash(password)

        const user = await User.create({
            username: username,
            email: email,
            password: hashedPassword,
        }).save()
        await sendConfirmationEmail(email, await createConfirmationUrl(user.id))
        return user
    }

    @Mutation(() => User, { nullable: true })
    async signin(
        @Arg('usernameOrEmail') usernameOrEmail: string,
        @Arg('password') password: string
    ): Promise<User | null> {
        const { valid, errors } = validateSignIn(usernameOrEmail, password)

        if (!valid) throw new UserInputError('UsernameOrEmail', { errors })

        const user = await User.findOne(usernameOrEmail.includes('@') ? { where: { email: usernameOrEmail } } : { where: { username: usernameOrEmail } })

        if (!user) throw new UserInputError('user not found', {
            errors: {
                global: 'user not found'
            }
        })
        if (!user) return null
        if (!user.confirmed) return null
        const validPassword = await argon2.verify(user.password, password)

        if (!validPassword) throw new UserInputError('Wrong credentils', {
            errors: {
                global: 'Wrong credentails'
            }
        })
        return user
    }

    @Mutation(() => Boolean)
    async confirmUser(
        @Arg('token') token: string,
        @Ctx() { redis }: any
    ) {
        //
        const userId = await redis.get(token)
        if (!userId) {
            return false
        }

        await User.update({ id: userId }, { confirmed: true })
        await redis.del(token)
        return true
    }

    @Mutation(() => Boolean)
    async forgotpassword(
        @Arg('email') email: string,
        @Ctx() { redis }: any
    ) {
        const user = await User.findOne({ where: { email } })

        if (!user) return true

        const token = v4()

        await redis.set('forgot-password' + token, user.id, "ex", 60 * 60 * 24) // 1 day
        await sendConfirmationEmail(email, `<a href="http://localhost:3000/change-password/${token}">reset password</a>`)

        return true
    }

    @Mutation(() => User)
    async resetPassword(
        @Arg('newPassword') newPassword: string,
        @Arg('token') token: string,
    ): Promise<User | null> {
        if (!newPassword) throw new UserInputError('Error', {
            errors: {
                password: 'Password is required'
            }
        })

        if (newPassword.length < 6) throw new UserInputError('Error', {
            errors: {
                password: 'Password is too short'
            }
        })
        const user = await User.findOneOrFail({})

        // get token


        // await getConnection()
        //     .createQueryBuilder()
        //     .update(User)
        //     .set({ password: await argon2.hash(newPassword) })
        //     .where("id = :id", { id: userId })
        //     .execute();


        //return user
        return user
    }
}
