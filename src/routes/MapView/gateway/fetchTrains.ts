import { parse } from "valibot";
import { OdptTrainResponseSchema } from "../entity/odpt";
import type { OdptTrainResponse } from "../entity/odpt";

export async function fetchTrains(): Promise<OdptTrainResponse> {
  const resp = await fetch("/api/trains");
  const json = await resp.json();
  return parse(OdptTrainResponseSchema, json);
}
