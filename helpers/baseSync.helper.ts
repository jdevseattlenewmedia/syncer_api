import Airtable from "airtable";
import Webflow from "webflow-api";
import axios from "axios";
// import { integer } from "aws-sdk/clients/cloudfront";
import { updateWebflowCollectionItem } from "../helpers/webflow.helper";

import BaseServices from "../services/bases.service";
const BaseService = new BaseServices();
interface combinedFieldsInterface {
  airtableFieldName: string;
  airtableFieldId: string;
  webflowFieldId: string;
  webflowFieldSlug: string;
  webflowField: {
    name: string;
    slug: string;
    type: string;
    required: boolean;
    editable: boolean;
    id: string;
  };
}

interface WebflowData {
  [key: string]: unknown;
}
interface syncAirtableAndWebflowInterface {
  //   baseId: integer;
  //   connectedBaseId: number;
  [key: string]: string;
}

async function fetchAirtableRecords(
  apiKey: string,
  airTableBaseId: string,
  tableId: string,
  view: string,
  maxRecords = 20
) {
  const airtable = new Airtable({ apiKey }).base(airTableBaseId);
  const records: any = [];
  await new Promise<void>((resolve, reject) => {
    airtable(tableId)
      .select({ view, maxRecords })
      .eachPage(
        (pageRecords, fetchNextPage) => {
          records.push(...pageRecords);
          if (maxRecords && records.length >= maxRecords) {
            fetchNextPage(); // Stop the iteration
          } else {
            fetchNextPage(); // Continue to the next page
          }
        },
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
  });
  return records;
}

export async function getAirTableFields(
  accessToken: any,
  baseId: any,
  tableId: any
) {
  const url = `https://api.airtable.com/v0/meta/bases/${baseId}/tables`;
  const requestOptions = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
  let responseData = {};

  try {
    const response = await axios(url, requestOptions);
    const data = response?.data;
    const tables = data?.tables || [];
    // @ts-ignore
    const selectedTable = tables.find((t) => t.id === tableId);
    if (selectedTable) {
      //   responseData = selectedTable.fields || [];
      //   const fieldIds: any = {};
      const fields = selectedTable.fields || [];
      interface Field {
        name: string;
        id: string;
      }
      // @ts-ignore
      fields?.forEach((field: Field) => (responseData[field?.id] = field.name)); // get current field name by id
      //   fields?.forEach((field: Field) => (responseData[field.name] = field?.id));
    }
  } catch (error) {
    console.log({ error });
    throw error;
  }
  return responseData;
}

export async function getWebFLowFields(
  webflowApi: any,
  webflowCollectionId: any
) {
  // @ts-ignore
  const collection = await webflowApi.collection({
    collectionId: webflowCollectionId,
  });

  const fields = collection?.fields || [];
  interface Field {
    name: string;
    id: string;
  }
  const responseData = {};
  // @ts-ignore
  fields?.forEach((field: Field) => (responseData[field?.id] = field)); // get current field name by id
  //   fields?.forEach((field: Field) => (responseData[field.name] = field?.id));
  return responseData;
}

function convertValueByType(type: string, value: any) {
  if (!value) return "";
  switch (type) {
    case "PlainText":
    case "RichText":
    case "Link":
    case "Email":
    case "Phone":
    case "Color":
    case "Option":
      return value?.toString();
    case "Number":
      return parseFloat(value);
    case "DateTime":
      return new Date(value);
    case "Switch":
      return value === "true";
    case "Image":
    case "MultiImage":
    case "Video":
    case "File":
      return value.toString(); // Assuming value is a URL or file path
    case "Reference":
    case "MultiReference":
      return Array.isArray(value) ? value : [value];
    default:
      return value?.toString();
    //   throw new Error(`Unknown field type: ${type}`);
  }
}

function createSlug(str = "") {
  if (!str) {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let slug = "";
    for (let i = 0; i < 10; i++) {
      slug += chars[Math.floor(Math.random() * chars.length)];
    }
    return slug;
  } else {
    // remove spaces and convert to lowercase
    return str?.trim()?.toLowerCase().replace(/\s+/g, "-");
  }
}

export async function syncAirtableAndWebflow({
  baseId,
  connectedBaseId,
  airtableApiKey,
  airtableBaseId,
  airtableTableId,
  airtableView = "Grid view",
  webflowApiKey,
  webflowCollectionId,
  combinedFields,
}: syncAirtableAndWebflowInterface) {
  const maxRecords = 20;
  // Initialize Airtable and Webflow clients
  const airtable = new Airtable({ apiKey: airtableApiKey }).base(
    airtableBaseId
  );

  // @ts-ignore
  const webflowApi = new Webflow({ token: webflowApiKey });

  const webFlowAllFieldsWithName = await getWebFLowFields(
    webflowApi,
    webflowCollectionId
  );

  const airtableRecords = await fetchAirtableRecords(
    airtableApiKey,
    airtableBaseId,
    airtableTableId,
    airtableView,
    maxRecords
  );

  const airtableAllFieldIdsWithName = await getAirTableFields(
    airtableApiKey,
    airtableBaseId,
    airtableTableId
  );
  const savedWeflowItemsIds: Array<string> = [];
  // Iterate through Airtable records and synchronize with Webflow
  for (const record of airtableRecords) {
    // Map Airtable fields to Webflow fields

    const airtableRecordId = record.id;
    const airtableRecordFields = record.fields;

    const webflowData: WebflowData = {};
    // @ts-ignore
    combinedFields?.forEach(
      ({
        airtableFieldName,
        airtableFieldId,
        webflowField,
        webflowFieldId,
      }: combinedFieldsInterface) => {
        // console.log({ webflowField });
        // @ts-ignore
        const getAirtableFieldName =
          // @ts-ignore
          airtableAllFieldIdsWithName[airtableFieldId];
        // @ts-ignore
        const getWebFlowField = webFlowAllFieldsWithName[webflowFieldId] || {};
        const getWebflowFieldName = getWebFlowField?.slug || "";
        const getWebflowFieldType = getWebFlowField?.type || "";

        // @ts-ignore

        const dataFromAirtable = record.get(getAirtableFieldName);
        const dataFromAirtableConverted = convertValueByType(
          getWebflowFieldType,
          dataFromAirtable
        );
        if (getWebflowFieldName === "slug") {
          webflowData[getWebflowFieldName] = createSlug(
            dataFromAirtableConverted || ""
          );
        } else {
          webflowData[getWebflowFieldName] = dataFromAirtableConverted || "";
        }
      }
    );

    const saveSyncData = await BaseService.saveSyncedBaseItemRows({
      connectedBaseId,
      sourceFiledId: airtableRecordId,
      targetFiledId: airtableRecordId,
      isSourceFieldActive: true,
      isTargetFieldActive: true,
    });

    if (!saveSyncData) {
      console.log("creating");
      const result = await webflowApi
        .createItem({
          collectionId: webflowCollectionId,
          fields: {
            ...webflowData,
            _archived: false,
            _draft: false,
          },
        })
        .then(async (dataFromWebflow) => {
          await BaseService.createOrUpdateSyncedBaseItemRows({
            connectedBaseId,
            sourceFiledId: airtableRecordId,
            targetFiledId: dataFromWebflow._id,
            isSourceFieldActive: true,
            isTargetFieldActive: true,
          });
          savedWeflowItemsIds.push(dataFromWebflow._id);
        })
        .catch((err) => {
          console.log({ m: err.response?.data });
          //   throw new Error(err.response?.data?.msg ?? "Failed to sync");
        });
    } else {
      // already exisits , update data

      const weflowDataId = saveSyncData?.targetFiledId;

      // @ts-ignore
      const updateWebflowData = {
        fields: {
          ...webflowData,
          _archived: false,
          _draft: false,
        },
      };
      console.log("updating", updateWebflowData);
      try {
        await webflowApi
          // @ts-ignore
          .patch(`/collections/${webflowCollectionId}/items/${weflowDataId}`, {
            fields: {
              ...webflowData,
              _archived: false,
              _draft: false,
            },
          })
          .then(async (dataFromWebflow: any) => {
            savedWeflowItemsIds.push(weflowDataId);
          });

        // const result = await updateWebflowCollectionItem(
        //   webflowCollectionId,
        //   weflowDataId,
        //   webflowApiKey,
        //   updateWebflowData
        // );
      } catch (error) {
        // @ts-ignore
        console.log({ message: error?.response });
      }

      // await webflowApi
      //   .updateItem({ ...updateWebflowData })
      //   .then(async (dataFromWebflow) => {
      //     // await BaseService.createOrUpdateSyncedBaseItemRows({
      //     //   connectedBaseId,
      //     //   sourceFiledId: airtableRecordId,
      //     //   targetFiledId: dataFromWebflow._id,
      //     //   isSourceFieldActive: true,
      //     //   isTargetFieldActive: true,
      //     // });
      //   })
      //   .catch((err) => {
      //     console.log({ updateError: err.response?.data });
      //     throw new Error(err.response?.data?.msg ?? "Failed to sync");
      //   });
    }
  }

  if (savedWeflowItemsIds && savedWeflowItemsIds.length > 0) {
    try {
      await webflowApi
        // @ts-ignore
        .put(`/collections/${webflowCollectionId}/items/publish`, {
          itemIds: savedWeflowItemsIds,
        })
        .then(async (dataFromWebflow: any) => {
          console.log("PUBLISHED", savedWeflowItemsIds);
        });
    } catch (error) {
      // @ts-ignore
      console.log({ publishError: error?.response?.data });
      // throw new Error(error?.response?.data?.msg?? "Failed to sync");
      console.log("PUBLISHED ERROR", savedWeflowItemsIds);
    }
  }
}
