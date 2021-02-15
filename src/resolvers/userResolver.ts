import argon2 from 'argon2'
import { validateSignIn, validateSignup } from '../utils/validators'
import { Resolver, Mutation, Query, Arg, InputType, Field, } from 'type-graphql'
import { User } from '../entity/User'
import { UserInputError, AuthenticationError } from 'apollo-server-express'
import { sendConfirmationEmail } from '../utils/sendConfirmationEmail'
import { sendResetPasswordEmail } from '../utils/sendResetPasswordEmail'
import jwt from 'jsonwebtoken'
import { getConnection } from 'typeorm'

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

        const userExists = await User.findOne({ where: { email: inputs.email } })

        if (userExists) {
            throw new UserInputError('Username is taken', {
                errors: {
                    email: 'This username is taken'
                }
            })
        }

        const hashedPassword = await argon2.hash(inputs.password)

        const user = await User.create({
            username: inputs.username,
            email: inputs.email,
            password: hashedPassword
        }).save()
        await sendConfirmationEmail()
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
        const validPassword = await argon2.verify(user.password, password)

        if (!validPassword) throw new UserInputError('Wrong credentils', {
            errors: {
                global: 'Wrong credentails'
            }
        })
        return user
    }
    @Mutation(() => Boolean)
    async forgotpassword(
        @Arg('email') email: string,
    ) {
        const user = await User.findOne({ where: { email } })

        if (!user) return true
        const token = jwt.sign({
            id: user.id,
            email
        }, process.env.JWT_SECRET as string, { expiresIn: '1h' })
        await sendResetPasswordEmail()
        return true
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

        // get token


        await getConnection()
            .createQueryBuilder()
            .update(User)
            .set({ password: await argon2.hash(newPassword) })
            .where("id = :id", { id: userId })
            .execute();


        //return user
    }
}
