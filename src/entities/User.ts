//entities are for database/orm

import { Entity, OptionalProps, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class User {
  [OptionalProps]?: 'createdAt' | 'updatedAt';
  //@Field gives you the permission to fetch data
  @Field()
  @PrimaryKey()
  id!: number;

  @Field(()=>String)
  @Property({ type: "date" })
  createdAt = new Date();

  @Field(()=>String)
  @Property({ type: "date", onUpdate: () => new Date() })
  updatedAt = new Date();

  @Field()
  @Property({ type: "text",unique:true })
  username!: string;

  @Field()
  @Property({ type: "text",unique:true })
  email!: string;

  @Property({ type: "text" })
  password!: string;
}