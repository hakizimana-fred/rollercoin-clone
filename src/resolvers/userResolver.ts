import { Resolver, Mutation, Query, Arg } from 'type-graphql'

@Resolver()
export class UserResolver {
    @Query(() => String)
    helloworld() {
        return 'hello there'
    }

    @Mutation(() => String)
    signup(
        @Arg('username') username: string,
        @Arg('email') email: string,
        @Arg('password') password: string
    ) {

        console.log(username, email, password);
        return 'user created'
    }

}