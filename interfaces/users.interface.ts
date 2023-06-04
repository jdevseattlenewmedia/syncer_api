export interface UserInterface {
  id: number;
  userName: string;
}

export interface JwtPayload {
  sub: string;
  iss: string;
  aud: string;
  iat: number;
  exp: number;
  "cognito:username": string;
}

export interface UserAttributes {
  id: number;
  email: string;
  cognitoUserId?: string;
  passwordHash?: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  role: string;
}
