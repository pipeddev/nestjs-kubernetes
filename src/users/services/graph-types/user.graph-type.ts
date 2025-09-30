import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserType {
  @Field(() => String)
  id: string;

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
