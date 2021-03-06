import { MiddlewareFn } from "type-graphql";
import {sign,verify } from "jsonwebtoken";
import { MyContext } from "./types";

export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {

  const authorization = context.req.headers["authorization"];

  if (!authorization) {
    throw new Error("Not authenticated");
  }

  try {
    const token = authorization.split(" ")[1];
    const payload = verify(token, "process.env.JWT_SECRET");
    console.log(payload);
    context.payload = payload as any;
  } catch (err) {
    console.log(err);
    throw new Error("Not authenticated");
  }
  return next();
};
