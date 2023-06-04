import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
} from "amazon-cognito-identity-js";

export async function login({
  userPoolId = process.env.AWS_COGNITO_USER_POOL_UI || "",
  clientId = process.env.AWS_COGNITO_CLIENT_ID_UI || "",
  userName,
  password,
}) {
  const authenticationData = {
    Username: userName,
    Password: password,
  };
  const authenticationDetails = new AuthenticationDetails(authenticationData);

  const userPool = new CognitoUserPool({
    UserPoolId: userPoolId,
    ClientId: clientId,
  });

  const userData = {
    Username: userName,
    Pool: userPool,
  };
  const cognitoUser = new CognitoUser(userData);

  return new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        const accessToken = result.getAccessToken().getJwtToken();
        const idToken = result.getIdToken().getJwtToken();
        const refreshToken = result.getRefreshToken().getToken();

        resolve({ accessToken, idToken, refreshToken });
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
}
