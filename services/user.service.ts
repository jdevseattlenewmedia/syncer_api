// import { hash } from "bcrypt";
import db from "../models";
const { Service, User, ConnectedService } = db;
import { CreateUserDto } from "../dtos/users.dto";
import { HttpException } from "../exceptions/HttpException";
import { UserInterface } from "../interfaces/users.interface";
import { isEmpty } from "../utils/util";

class UserService {
  public users = db.User;

  public async findAllUser(): Promise<UserInterface[]> {
    const allUser: UserInterface[] = await this.users.findAll();
    return allUser;
  }

  public async findUserById(userId: number): Promise<UserInterface> {
    if (isEmpty(userId)) throw new HttpException(400, "UserId is empty");

    const findUser: UserInterface = await this.users.findByPk(userId);
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    return findUser;
  }

  public async getUsersWithService(serviceNameInDb: string): Promise<{}> {
    // Fetch the Service object that matches the given name
    const service = await Service.findOne({ where: { name: serviceNameInDb } });

    // Fetch the ConnectedService objects that match the given service ID
    const connectedServices = await ConnectedService.findAll({
      where: { serviceId: service.id },
    });

    // Fetch the User objects that correspond to the ConnectedService objects
    const userIds = connectedServices.map(
      (connectedService: { userId: any }) => connectedService.userId
    );
    const users = await this.users.findAll({ where: { id: userIds } });

    return users;
  }

  public async getAllConnectedServicesByUserId(userId: any) {
    try {
      const user = await User.findOne({
        where: { id: userId },
        include: {
          model: ConnectedService,
          include: {
            model: Service,
          },
        },
      });
      if (!user) {
        throw new HttpException(409, "User not found");
      }
      const connectedServices = user.ConnectedServices;
      return connectedServices;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async saveCognitoUser(userData: CreateUserDto): Promise<any> {
    try {
      const hashedPassword = userData.password || "randomPassword"; //await hash(userData.password, 10);
      const user = await this.users.create({
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        cognitoUserId: userData.cognitoUserId,
        cognitoUserName: userData.cognitoUserName,
        role: userData.role,
      });
      return user;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // public async createUser(userData: CreateUserDto): Promise<User> {
  //   if (isEmpty(userData)) throw new HttpException(400, "userData is empty");

  //   const findUser: User = await this.users.findOne({
  //     where: { email: userData.email },
  //   });
  //   if (findUser)
  //     throw new HttpException(
  //       409,
  //       `This email ${userData.email} already exists`
  //     );

  //   const hashedPassword = hash(userData?.password!, 10);
  //   const createUserData: User = await this.users.create({
  //     ...userData,
  //     password: hashedPassword,
  //   });
  //   return createUserData;
  // }

  // public async updateUser(
  //   userId: number,
  //   userData: CreateUserDto
  // ): Promise<User> {
  //   if (isEmpty(userData)) throw new HttpException(400, "userData is empty");

  //   const findUser: User = await this.users.findByPk(userId);
  //   if (!findUser) throw new HttpException(409, "User doesn't exist");

  //   const hashedPassword = await hash(userData.password, 10);
  //   await this.users.update(
  //     { ...userData, password: hashedPassword },
  //     { where: { id: userId } }
  //   );

  //   const updateUser: User = await this.users.findByPk(userId);
  //   return updateUser;
  // }

  // public async deleteUser(userId: number): Promise<User> {
  //   if (isEmpty(userId)) throw new HttpException(400, "User doesn't existId");

  //   const findUser: User = await this.users.findByPk(userId);
  //   if (!findUser) throw new HttpException(409, "User doesn't exist");

  //   await this.users.destroy({ where: { id: userId } });

  //   return findUser;
  // }
}

export default UserService;
