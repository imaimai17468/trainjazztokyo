import { parse } from "valibot";
import { OdptTrainResponseSchema } from "../entity/odpt";
import type { OdptTrainResponse } from "../entity/odpt";
import { mockTrains } from "./mock/trains";

const ODPT_API_BASE = "https://api-tokyochallenge.odpt.org/api/v4";
const USE_MOCK = true;

export async function fetchTrains(apiKey?: string): Promise<OdptTrainResponse> {
  if (USE_MOCK) {
    return mockTrains;
  }

  const url = `${ODPT_API_BASE}/odpt:Train?acl:consumerKey=${apiKey}`;
  const resp = await fetch(url);
  const json = await resp.json();
  return parse(OdptTrainResponseSchema, json);
}
