// import "source-map-support/register";
import createServer from "@vendia/serverless-express";
import { APIGatewayProxyEvent, Context, Callback } from "aws-lambda";

import { app } from "./server";
import { RequestListener } from "http";

// const server = createServer({ app });
const server = createServer({ app: app as unknown as RequestListener });

export async function lambdaHandler(
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback
) {
  return server(event, context, callback);
}
// export const handler = serverlessExpress({ app });
