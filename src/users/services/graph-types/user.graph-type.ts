import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserType {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  email: string;
}

@ObjectType()
export class UsersType {
  @Field(() => [UserType])
  users: UserType[];
}
