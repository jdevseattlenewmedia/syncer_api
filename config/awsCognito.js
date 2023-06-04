import { CognitoJwtVerifier } from "aws-jwt-verify";

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.AWS_COGNITO_USER_POOL_UI, // mandatory, can't be overridden upon calling verify
  // tokenUse: "access", // needs to be specified here or upon calling verify
  tokenUse: "id", // needs to be specified here or upon calling verify
  clientId: process.env.AWS_COGNITO_CLIENT_ID_UI, // needs to be specified here or upon calling verify
  // groups: "admins", // optional
  // graceSeconds: 0, // optional
  // scope: "my-api/read", // optional
  // customJwtCheck: (payload, header, jwk) => {}, // optional
});
export async function verifyToken(idToken) {
  try {
    const payload = await verifier.verify(idToken);
    console.log("Auth Token is valid");
    return payload || null;
  } catch {
    console.log("Auth Token not valid!");
  }
}
