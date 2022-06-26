//resolvers are like controllers.

import { Post } from "../entities/Post";
import { MyContext } from "src/types";
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver{
    //@Query decorator is for getting data
    //gets all the posts
    @Query(()=>[Post])
    posts(
        @Ctx() {em}:MyContext
    ):Promise<Post[]>{
        return em.find(Post,{})
    }

    //gets one post matching with the id
    @Query(()=>Post,{nullable:true})
    post(
        @Arg("id",()=>Int) id:number,
        @Arg("title",()=>String) title:string,
        @Ctx() {em}:MyContext
    ):Promise<Post | null>{
        return em.findOne(Post,{id,title})
    }

    //get all posts with the same title
    @Query(()=>[Post],{nullable:true})
    matchedPost(
        @Arg("title",()=>String) title:string,
        @Ctx() {em}:MyContext
    ):Promise<Post[] | null>{
        return em.find(Post,{title})
    }

    //mutation decorator is for creating,updating and deleting
    //creates a post
    @Mutation(()=>Post)
    async createPost(
        @Arg("title",()=>String) title:string,
        @Ctx() {em}:MyContext
    ):Promise<Post>{
        const post = em.create(Post, {title});
        await em.persistAndFlush(post);
        return post
    }

    //update a post
    @Mutation(()=>Post)
    async updatePost(
        @Arg("id",()=>Int) id:number,
        @Arg("title",()=>String,{nullable:true}) title:string,
        @Ctx() {em}:MyContext
    ):Promise<Post | null>{
        const post = await em.findOne(Post,{id})

        if(!post){
            return null
        }

        if(typeof title!=='undefined'){
            post.title=title
            await em.persistAndFlush(post);
        }
        return post
    }


    //delete a post
    @Mutation(()=>Boolean)
    async deletePost(
        @Arg("id",()=>Int) id:number,
        @Ctx() {em}:MyContext
    ):Promise<boolean>{
        await em.nativeDelete(Post,{id})
        return true
    }
}
