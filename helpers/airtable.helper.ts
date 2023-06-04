import axios from "./axiosHelper";
import { HttpException } from "../exceptions/HttpException";
interface GetAirtableBaseListOptions {
  accessToken: string;
}

interface GetAirtableTablesOptions {
  accessToken: string;
  baseId: string;
}
interface GetAirtableTablesDetailsOptions {
  accessToken: string;
  baseId: string;
  tableId: string;
}

export async function getAirtableBaseList(options: GetAirtableBaseListOptions) {
  const { accessToken } = options;
  const url = `https://api.airtable.com/v0/meta/bases`;
  const requestOptions = {
    url,
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
  let responseData = [];
  console.log({ requestOptions });
  try {
    const response = await axios(requestOptions);
    const data = response?.data;
    responseData = data || [];
  } catch (error) {
    console.log({ error });
  }
  return responseData;
}

export async function refreshAirtableToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string
): Promise<any> {
  const url = "https://airtable.com/oauth2/v1/token";
  const auth = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  )}`;
  const options = {
    method: "POST",
    url,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: auth,
    },
    data: `grant_type=refresh_token&refresh_token=${refreshToken}`,
  };

  try {
    const response = await axios(options);
    const data = response.data;
    console.log({ data });
    if (data.access_token) {
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        rereshExpiresIn: data.refresh_expires_in,
        tokenType: data.token_type,
      };
    } else {
      throw new Error("Failed to refresh the access token");
    }
  } catch (error) {
    console.error("Error refreshing Airtable access token:", error);
    throw error;
  }
}

export async function getAirtableTables(options: GetAirtableTablesOptions) {
  const { accessToken, baseId } = options;
  const url = `https://api.airtable.com/v0/meta/bases/${baseId}/tables`;
  const requestOptions = {
    url,
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
  let responseData = [];
  console.log({ requestOptions });
  try {
    const response = await axios(requestOptions);
    const data = response?.data;
    responseData = data?.tables || [];
  } catch (error) {
    console.log({ error });
    throw error;
  }
  return responseData;
}
export async function getAirtableTableDetails(
  options: GetAirtableTablesDetailsOptions
) {
  const { accessToken, baseId, tableId } = options;
  const url = `https://api.airtable.com/v0/${baseId}/${tableId}`;
  const requestOptions = {
    url,
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
  let responseData = [];
  console.log({ requestOptions });
  try {
    const response = await axios(requestOptions);
    console.log({ response });
    const data = response?.data;
    responseData = data || {};
  } catch (error) {
    console.log({ error });
    throw error;
  }
  return responseData;
}

export async function getMeDataService({
  accessToken,
}: {
  accessToken: string;
}) {
  const url = "https://api.airtable.com/v0/meta/whoami";
  const requestOptions = {
    url,
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
  let responseData = null;

  try {
    const response = await axios(requestOptions);
    responseData = response?.data;
  } catch (error) {
    throw error;
    // new HttpException(500, "Wrong authentication token");
    // console.error("Error retrieving user data:", error?.response?.data);
  }

  return responseData;
}
// export async function getAirtableTableDetails(
//   options: GetAirtableTablesDetailsOptions
// ) {
//   const { accessToken, baseId, tableId } = options;
//   const url = `https://api.airtable.com/v0/${baseId}/${tableId}/listRecords`; // Update URL to use listRecords endpoint
//   const requestOptions = {
//     method: "POST", // Use POST method
//     headers: {
//       Authorization: `Bearer ${accessToken}`,
//     },
//     params: {
//       fields: "records", // Include empty fields
//       // returnFieldsByFieldId: true,
//     },
//   };
//   let responseData = [];
//   console.log({ requestOptions });
//   try {
//     const response = await axios(url, requestOptions);
//     console.log({ response });
//     const data = response?.data;
//     responseData = data?.records || [];
//   } catch (error) {
//     console.log({ error });
//     throw error;
//   }
//   return responseData;
// }

// async function getAllRecordsWithPagination() {
// const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;
// const headers = {
//   Authorization: `Bearer ${apiKey}`,
// };
//   let records = [];
//   let offset = null;
//   let shouldContinue = true;

//   while (shouldContinue) {
//     const params = {
//       pageSize: 100, // Maximum number of records to retrieve in a single request
//       offset: offset, // Offset value returned in the previous response
//     };

//     const response = await fetch(url, { headers, params });
//     const result = await response.json();

//     records = [...records, ...result.records]; // Combine records from the current and previous responses

//     if (result.offset) {
//       offset = result.offset; // Set the offset to retrieve the next page of records
//     } else {
//       shouldContinue = false; // All records have been retrieved
//     }
//   }

//   return records;
// }
