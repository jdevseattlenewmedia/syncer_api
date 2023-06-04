import db from "../models";
const { Base, ConnectedBase, ConnectedService, ConnectedBaseItem } = db;

class BaseServices {
  public Bases = Base;
  public ConnectedBase = ConnectedBase;
  public ConnectedBaseItem = ConnectedBaseItem;

  public async getBaseDataById(baseId: number) {
    try {
      const baseData = await this.Bases.findOne({
        where: { id: baseId },
        include: [
          {
            model: ConnectedBase,
            include: [
              { model: ConnectedService, as: "connectedService" },
              { model: ConnectedService, as: "connectedServiceWebflow" },
            ],
          },
        ],
      });

      if (!baseData) {
        throw new Error(`No base found with the ID: ${baseId}`);
      }

      return baseData;
    } catch (error) {
      throw error;
    }
  }

  /**
   * This function will create a new connected service in the database and return the new connected
   * service's ID.
   * @param {any} insertData - This is the data that you want to insert into the database.
   */
  public async createNewBase(insertData: any): Promise<any> {
    const insertedData = this.Bases.create(insertData);
    return insertedData;
  }
  public async createNewConnectedBase(insertData: any): Promise<any> {
    const insertedData = this.ConnectedBase.create(insertData);
    return insertedData;
  }

  public updateBaseData(id: number, updateData: any): Promise<any> {
    return this.Bases.update(updateData, { where: { id } });
  }

  public updateConnectedBaseData(id: number, updateData: any): Promise<any> {
    return this.ConnectedBase.update(updateData, { where: { id } });
  }
  public deleteBaseData(id: number): Promise<any> {
    return this.Bases.destroy({ where: { id } });
  }
  public deleteConnectedBaseData(id: number): Promise<any> {
    return this.ConnectedBase.destroy({ where: { id } });
  }

  public async findAllBasesWithConnection({ userId }: any): Promise<any> {
    const allData = await this.Bases.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      include: {
        model: ConnectedBase,
        include: [
          {
            model: ConnectedService,
            as: "connectedService",
          },
          {
            model: ConnectedService,
            as: "connectedServiceWebflow",
          },
        ],
      },
    });
    return allData;
  }

  public async setEnableAutoSync(
    baseId: number,
    enableAutoSync: boolean,
    userId: number
  ): Promise<any> {
    return this.Bases.update(
      { enableAutoSync },
      { where: { id: baseId, userId } }
    );
  }
  public async saveSyncedBaseItemRows(item: any): Promise<any> {
    const [baseItem, created] = await this.ConnectedBaseItem.findOrCreate({
      where: { sourceFiledId: item.sourceFiledId },
      defaults: item,
    });
    return created ? null : baseItem;
  }

  public async createOrUpdateSyncedBaseItemRows(item: any): Promise<any> {
    const [baseItem, created] = await this.ConnectedBaseItem.findOrCreate({
      where: { sourceFiledId: item.sourceFiledId },
      defaults: item,
    });

    if (!created) {
      await this.ConnectedBaseItem.update(item, {
        where: { sourceFiledId: item.sourceFiledId },
      });
    }

    return baseItem;
  }

  public async saveSyncedBaseItemRowsBulk(items: any): Promise<any> {
    const allData = await this.ConnectedBaseItem.bulkCreate(items);
    return allData;
  }
  public async deleteSyncedBaseItemRows(id: number): Promise<any> {
    return this.ConnectedBaseItem.destroy({ where: { id } });
  }
  public async deleteSyncedBaseItemsRows(ids: any): Promise<any> {
    return this.ConnectedBaseItem.destroy({ where: { id: ids } });
  }
  public async findAllBaseItemsRows({ baseId }: any): Promise<any> {
    const allData = await this.ConnectedBaseItem.findAll({
      where: { baseId },
    });
    return allData;
  }
  public async findAllBaseItemRowsWithConnection({
    baseId,
  }: any): Promise<any> {
    const allData = await this.ConnectedBaseItem.findAll({
      where: { baseId },
      include: {
        model: ConnectedBase,
        include: [
          {
            model: ConnectedService,
            as: "connectedService",
          },
          {
            model: ConnectedService,
            as: "connectedServiceWebflow",
          },
        ],
      },
      order: [["createdAt", "DESC"]],
    });
    return allData;
  }
}

export default BaseServices;
