import axios from "axios";

export const getSitesFromWebflow = async (accessToken: string) => {
  try {
    const response = await axios.get("https://api.webflow.com/sites", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "accept-version": "1.0.0",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCollectionsFromWebflow = async (
  siteId: string,
  accessToken: string
) => {
  try {
    const response = await axios.get(
      `https://api.webflow.com/sites/${siteId}/collections`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "accept-version": "1.0.0",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCollectionDetailsFromWebflow = async (
  collectionId: string,
  accessToken: string
) => {
  try {
    console.log({
      a: `https://api.webflow.com/collections/${collectionId}`,

      headers: {
        Authorization: `Bearer ${accessToken}`,
        "accept-version": "1.0.0",
      },
    });
    const response = await axios.get(
      `https://api.webflow.com/collections/${collectionId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "accept-version": "1.0.0",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const updateWebflowCollectionItem = async (
  collectionId: string,
  itemId: string,
  accessToken: string,
  data: Object
) => {
  try {
    const url = `https://api.webflow.com/collections/${collectionId}/items/${itemId}`;
    const options = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "accept-version": "1.0.0",
        accept: "application/json",
        "content-type": "application/json",
      },
    };
    const response = await axios.patch(url, data, options);
    return response.data;
  } catch (error) {
    throw error;
  }
};
