import db from "../models";
const { Service, User, ConnectedService } = db;
import { HttpException } from "../exceptions/HttpException";
import { isEmpty } from "../utils/util";
import DefaultServices from "../services/defaultServices.service";
interface Service {
  name: string;
  apiKey: string;
  clientId: string;
  clientSecret: string;
  authUrl: string;
  tokenUrl: string;
  redirectUrl: string;
  scope: string;
  id: string | number;
}

interface ConnectedServiceInterface {
  // [x: string]: any;
  serviceId: number;
  userId: number;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  isConnected: boolean;
  // currentStatus: string;
  createdAt: Date;
  updatedAt: Date;
  codeVerifier: string;
  id: string | number;
  currentStatus: string;
}

class ConnectedServices {
  public Service = Service;
  public Users = User;
  public ConnectedService = ConnectedService;
  public defaultServices = new DefaultServices();

  private formatConnectedServices(
    connectedServices: ConnectedServiceInterface[]
  ): Partial<ConnectedServiceInterface>[] {
    return connectedServices.map((service) => ({
      id: service.id,
      userId: service.userId,
      accessToken: service.accessToken,
      // serviceId: service.serviceId,
      // refreshToken: service.refreshToken,
      // tokenType: service.tokenType,
      isConnected: service.isConnected,
      currentStatus: service.currentStatus,
    }));
  }

  /**
   * This function will create a new connected service in the database and return the new connected
   * service's ID.
   * @param {any} insertData - This is the data that you want to insert into the database.
   */
  public async createNewConnectedService(insertData: any): Promise<any> {
    const insertedData = this.ConnectedService.create(insertData);
    return insertedData;
  }

  // public async getConnectedServiceByid(id: number): Promise<any> {
  //   const connectedServiceData = await this.ConnectedService.findByPk(id);
  //   return connectedServiceData;
  // }

  public updateConnectedService(id: number, updateData: any): Promise<any> {
    return this.ConnectedService.update(updateData, { where: { id } });
  }

  public async findAllConnectedServiceByUserId({
    serviceId,
    userId,
  }: ConnectedServiceInterface): Promise<ConnectedServiceInterface[]> {
    const allData: ConnectedServiceInterface[] =
      await this.ConnectedService.findAll({
        where: { serviceId, userId },
        // include: {
        //   model: ConnectedService,
        //   include: {
        //     model: Service,
        //   },
        // }
      });
    return allData;
  }
  public async findAllConnectedServiceByServiceId({
    serviceId,
    currentStatus = null,
  }: {
    serviceId: number | string;
    currentStatus: number | string | null | undefined;
  }): Promise<ConnectedServiceInterface[]> {
    const allData: ConnectedServiceInterface[] =
      await this.ConnectedService.findAll({
        where: { serviceId },
        include: {
          model: Service,
        },
      });
    return allData;
  }

  // public async findById(id: number): Promise<Service> {
  //   if (isEmpty(id)) throw new HttpException(400, "id is empty");

  //   const findData: Service = await this.Service.findByPk(id);
  //   if (!findData) throw new HttpException(409, "User doesn't exist");

  //   return findData;
  // }
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

  public async getConnectedServiceById(
    id: number
  ): Promise<ConnectedServiceInterface | null> {
    if (isEmpty(id)) throw new HttpException(400, "id is empty");

    const connectedServiceData: ConnectedServiceInterface | null =
      await this.ConnectedService.findByPk(id);
    if (!connectedServiceData)
      throw new HttpException(409, "Connected Service doesn't exist");

    return connectedServiceData;
  }

  async getConnectedAirtableServices(
    userId: any,
    serviceName: string = "airtable"
  ) {
    try {
      const airtableService = await this.defaultServices.findByName(
        serviceName
      );
      const connectedServices = await this.ConnectedService.findAll({
        where: { userId, serviceId: airtableService.id, isConnected: true },
        order: [["id", "DESC"]],
      });
      const formatDataPublic = await this.formatConnectedServices(
        connectedServices
      );
      // console.log({ connectedServices });
      return formatDataPublic;
      // return true;
    } catch (error) {
      console.error("Error fetching connected Airtable services:", error);
      return [];
    }
  }
  async getConnectedWebFlowServices(
    userId: any,
    serviceName: string = "webflow"
  ) {
    try {
      const airtableService = await this.defaultServices.findByName(
        serviceName
      );
      const connectedServices = await this.ConnectedService.findAll({
        where: { userId, serviceId: airtableService.id, isConnected: true },
      });
      const formatDataPublic = await this.formatConnectedServices(
        connectedServices
      );
      // console.log({ connectedServices });
      return formatDataPublic;
      // return true;
    } catch (error) {
      console.error("Error fetching connected Airtable services:", error);
      return [];
    }
  }

  public async updateAccessToken(
    id: number,
    accessToken: string,
    expiresIn: number,
    refreshToken: string,
    currentStatus: string | null = "CONNECTED"
    // refreshExpiresIn: string,
  ): Promise<any> {
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    console.log("expiresAt:", expiresAt, "expiresIn", expiresIn);

    const updatedConnectedService = await this.ConnectedService.update(
      {
        accessToken,
        expiresIn,
        expiresAt,
        refreshToken,
        currentStatus,
        // refreshExpiresIn,
      },
      {
        where: { id },
      }
    );
    return updatedConnectedService;
  }

  public async revokeAuthorization(connectedServiceId: number) {
    try {
      await ConnectedService.update(
        {
          isConnected: false,
          accessToken: null,
          refreshToken: null,
          expiresIn: null,
          // any other fields that need to be reset
        },
        {
          where: { id: connectedServiceId },
        }
      );
    } catch (error) {
      throw error;
    }
  }
}

export default ConnectedServices;
