//resolvers are like controllers.
import {sign,verify} from 'jsonwebtoken'
import { User } from "../entities/User";
import { MyContext } from "src/types";
import * as argon2 from "argon2";
import { isAuth } from "../isAuth";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";

//user register type
@InputType()
class UserRegister {
  @Field()
  username: string;
  @Field()
  email: string;
  @Field()
  password: string;
}

//user login type
@InputType()
class UserLogin {
    @Field()
    username: string;
    @Field()
    password: string;
  }

  //error handling field and message
@ObjectType()
class FieldError{
    @Field()
    field:String

    @Field()
    message:String
}

//for error handling
@ObjectType()
class UserResponse{
    @Field(()=>[FieldError],{nullable:true})
    errors?:FieldError[]

    @Field(()=>User,{nullable:true})
    user?:User

    @Field(()=>String,{nullable:true})
    token?:String
}

@Resolver()
export class UserResolver {

@Mutation(() => String)
async Me(
    @Arg("token") token:string,
    @Ctx() { }: MyContext) {
    // const jwt = token.split(" ")[1];
    const payload = verify(token, "process.env.JWT_SECRET");
    // payload.name
    return(JSON.stringify(payload))
}


    //Register a new user
  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UserRegister,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    //error handling and validation

    //validating username
    if(options.username.length <= 2){
        return{
            errors:[
                {
                    field:"username",
                    message:"Length must be greater than 2!"
                }
            ]
        }
    }

    //validating email
    function validateEmail(email:string) 
    {
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    if(!validateEmail(options.email)){
        return{
            errors:[
                {
                    field:"email",
                    message:"Please provide a valid email address!"
                }
            ]
        }
    }

    //validating password
    if(options.password.length <= 9){
        return{
            errors:[
                {
                    field:"password",
                    message:"Length must be greater than 5!"
                }
            ]
        }
    }


    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, {
      username: options.username,
      email: options.email,
      password: hashedPassword,
    });
    
    try{
        await em.persistAndFlush(user);
    }catch(err){
        //check for duplicate username
        if(err.detail.includes("Key (username)")){
            return{
                errors:[
                    {
                        field:"username",
                        message:"Username has already been taken"
                    }
                ]
            }
        }

        //check for duplicate email
        if(err.detail.includes("Key (email)")){
            return{
                errors:[
                    {
                        field:"email",
                        message:"Email already used!"
                    }
                ]
            }
        }
    }

    return {user};
  }

  //login user if username matches
  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: UserLogin,
    @Ctx() { em,res }: MyContext
  ): Promise<UserResponse> {
    //checking if username exists in db
    const user = await em.findOne(User,{username:options.username})
    //error handling
    if(!user){
        return{
            errors:[
                {
                    field:"username",
                    message:"Invalid Username!"
                }
            ]
        }
    }
    //checking if password is correct
    const validPass = await argon2.verify(user.password,options.password);
    //error handling
    if(!validPass){
        return{
            errors:[
                {
                    field:"password",
                    message:"Incorrect Password!"
                }
            ]
        }
    }

 const token= await sign({ _id: user.id?.toString(), name: user.username }, "process.env.JWT_SECRET",{
        expiresIn: '2 days',
      });

      console.log(token)

    return ({token});
  }
}
