import 'reflect-metadata'
import { MikroORM } from "@mikro-orm/core";
import { ApolloServer } from "apollo-server-express";
import express from "express";
import { buildSchema } from "type-graphql";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import mikroConfig from "./mikro-orm.config";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from './resolvers/user';

const main = async () => {
  const orm = await MikroORM.init(mikroConfig);
  await orm.getMigrator().up;

  const generator = orm.getSchemaGenerator();
  await generator.updateSchema();


const app = express()


const apolloServer = new ApolloServer({
  schema: await buildSchema({
    resolvers: [PostResolver,UserResolver],
    validate: false,
  }),
    //exporting orm.em to all resolvers
  context:({req,res})=>({em:orm.em,req,res}),
});

apolloServer.applyMiddleware({app})

app.listen(4000,()=>{
  console.log("its running")
})

  // const post = await orm.em.find(Post,{});
  // const user = await orm.em.find(User,{});
  // console.log(post)
  // console.log(user)
};

main().catch((err) => {
  console.log(err);
});