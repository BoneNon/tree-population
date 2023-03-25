import { FetchResult } from "../models/NetworkResult";
import TreesRequestParams from "../models/TreesRequest";
import { TreesResponse } from "../models/TreesResponse";
import UpdateTreeInfoBody from "../models/UpdateTreeInfoBody";
import NetworkRequestHandler from "./NetworkRequestHandler";
import mockJson from "../../mockResponses/trees.json";

// TODO implement simple caching with a map to prevent multiple network calls. Thsi way, we can just think of all trees as server state and fetch on demand (whenever).
export default class VallarisService {
  private static _networkHandler = new NetworkRequestHandler({
    baseUrl: "https://v2k-dev.vallarismaps.com/core/api",
  });
  private static _collectionId = "641eb96d476571350cabeac3";

  public static async getAllTrees(
    request?: TreesRequestParams,
    fromCacheIfExists = true
  ): Promise<FetchResult<TreesResponse>> {
    //TODO join all data from all collections and including the local mock one.
    return { result: mockJson as TreesResponse, fromCache: true };
    const path = `/features/1.0/collections/${VallarisService._collectionId}/items`;
    const data = await VallarisService._networkHandler.handle<TreesResponse>({
      fromCacheIfExists,
      method: "GET",
      path: path,
      headers: {
        // @ts-ignore
        "api-key": import.meta.env.VITE_VALLARIS_API_KEY,
      },
      queryParams: {
        limit: request?.limit,
        bbox: request?.boundingBox?.join(" ,"),
      },
    });

    return data;
  }

  /**
   * Returns a pre-configured Libre map style
   *
   * config here: https://v2k-dev.vallarismaps.com/management/visual/style
   */
  public static getMapStyle(): FetchResult<string> {
    // TODO Replace Libre map style with the actual one we're gonna be using in prod.
    const styleId = "641ef0e2dd63c244d85b099a";

    return {
      result: `https://v2k-dev.vallarismaps.com/core/api/styles/1.0-beta/styles/${styleId}?api_key=${
        // @ts-ignore
        import.meta.env.VITE_VALLARIS_API_KEY
      }`,
      fromCache: true,
    };
  }

  public static async updateTreeData(
    request: UpdateTreeInfoBody
  ): Promise<FetchResult<void>> {
    const result = await VallarisService._networkHandler.handle<void>({
      method: "PUT",
      headers: {
        // @ts-ignore
        "api-key": import.meta.env.VITE_VALLARIS_API_KEY,
        "content-type": "application/json",
      },
      path: `/features/1.0-beta/collections/${VallarisService._collectionId}/items/${request.id}`,
      body: JSON.stringify(request),
    });

    return result;
  }
}
