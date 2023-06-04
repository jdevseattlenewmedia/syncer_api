import { IsString, IsEmail, IsInt, IsEnum } from "class-validator";
// import { UserRole } from "../models/User";
const UserRole = {
  USER: "USER",
};
export class CreateUserDto {
  @IsEmail()
  public email!: string;
  @IsString()
  public password!: string;
  @IsString()
  public firstName!: string;
  @IsString()
  public lastName!: string;
  @IsString()
  public cognitoUserId!: string;
  @IsString()
  public cognitoUserName!: string;
  @IsString()
  @IsEnum(UserRole, {
    message: "Invalid user role. Must be one of: " + Object.values(UserRole),
  })
  public role!: string;

  constructor(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    cognitoUserId: string,
    cognitoUserName: string,
    role: string
  ) {
    this.email = email;
    this.password = password;
    this.firstName = firstName;
    this.lastName = lastName;
    this.cognitoUserId = cognitoUserId;
    this.cognitoUserName = cognitoUserName;
    this.role = role;
  }
}
export class GenerateToken {
  @IsInt()
  public userId!: number;

  constructor(userId: number) {
    this.userId = userId;
  }
}
