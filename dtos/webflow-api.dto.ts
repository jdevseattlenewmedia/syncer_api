declare module "webflow-api" {
  interface WebflowData {
    [key: string]: any;
  }

  interface Item {
    _id: string;
    [key: string]: any;
  }

  interface ItemsResponse {
    items: Item[];
  }

  class Webflow {
    constructor(config: { apiToken: string });

    items(options: { collectionId: string }): Promise<ItemsResponse>;

    createItem(options: {
      collectionId: string;
      fields: WebflowData;
    }): Promise<Item>;

    updateItem(options: {
      collectionId: string;
      itemId: string;
      fields: WebflowData;
    }): Promise<Item>;
  }

  export = Webflow;
}
