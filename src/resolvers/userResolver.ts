import argon2 from 'argon2'
import { Resolver, Mutation, Query, Arg } from 'type-graphql'
import { User } from '../entity/User'

@Resolver()
export class UserResolver {
    @Query(() => String)
    helloworld() {
        return 'hello there'
    }

    @Mutation(() => User, { nullable: true })
    async signup(
        @Arg('username') username: string,
        @Arg('email') email: string,
        @Arg('password') password: string
    ): Promise<User | null> {
        const hashedPassword = await argon2.hash(password)

        const user = await User.create({
            username,
            email,
            password: hashedPassword
        }).save()
        return user
    }

    @Mutation(() => User, { nullable: true })
    async signin(
        @Arg('usernameOrEmail') usernameOrEmail: string,
        @Arg('password') password: string
    ): Promise<User | null> {
        const user = await User.findOne(usernameOrEmail.includes('@') ? {
            where: {
                email: usernameOrEmail
            }
        } : { where: { username: usernameOrEmail } })

        if (!user) return null
        const validPassword = await argon2.verify(user.password, password)

        if (!validPassword) return null
        return user
    }

}





