import 'reflect-metadata'
import { MikroORM } from "@mikro-orm/core";
import { ApolloServer } from "apollo-server-express";
import express from "express";
import { buildSchema } from "type-graphql";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import mikroConfig from "./mikro-orm.config";
import { PostResolver } from "./resolvers/post";

const main = async () => {
  const orm = await MikroORM.init(mikroConfig);
  await orm.getMigrator().up;
//   creating a post in DB
  // const post = orm.em.fork({}).create(Post, {
  //   title: "my first post12",
  // });
  // await orm.em.persistAndFlush(post);

const app = express()

const apolloServer = new ApolloServer({
  schema: await buildSchema({
    resolvers: [PostResolver],
    validate: false,
  }),
    //exporting orm.em to all resolvers
  context:()=>({em:orm.em}),
});



apolloServer.applyMiddleware({app})

app.listen(4000,()=>{
  console.log("its running")
})

  const posts = await orm.em.find(Post,{});
  console.log(posts)
};

main().catch((err) => {
  console.error(err);
});