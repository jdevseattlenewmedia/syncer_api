import db from "../models";
const { Service, User, ConnectedService } = db;
import { HttpException } from "../exceptions/HttpException";
import { isEmpty } from "../utils/util";

interface Service {
  id: any;
  name: string;
  apiKey: string;
  clientId: string;
  clientSecret: string;
  authUrl: string;
  tokenUrl: string;
  redirectUrl: string;
  scope: string;
}

class DefaultServices {
  public Service = Service;
  public Users = User;
  public ConnectedService = ConnectedService;

  public async findAll(): Promise<Service[]> {
    const allData: Service[] = await this.Service.findAll();
    return allData;
  }

  public async findById(id: number): Promise<Service> {
    if (isEmpty(id)) throw new HttpException(400, "id is empty");

    const findData: Service = await this.Service.findByPk(id);
    if (!findData) throw new HttpException(409, "User doesn't exist");

    return findData;
  }
  public async findByName(name: string): Promise<Service> {
    if (isEmpty(name)) throw new HttpException(400, "name is empty");

    const findData: Service | null = await this.Service.findOne({
      where: { name },
    });
    if (!findData) throw new HttpException(409, "Service doesn't exist");

    return findData;
  }

  public async getUsersWithService(serviceNameInDb: string): Promise<{}> {
    // Fetch the Service object that matches the given name
    const service = await Service.findOne({ where: { name: serviceNameInDb } });

    // Fetch the ConnectedService objects that match the given service ID
    const connectedServices = await this.ConnectedService.findAll({
      where: { serviceId: service.id },
    });

    // Fetch the User objects that correspond to the ConnectedService objects
    const userIds = connectedServices.map(
      (connectedService: { userId: any }) => connectedService.userId
    );
    const users = await this.Users.findAll({ where: { id: userIds } });

    return users;
  }
}

export default DefaultServices;
