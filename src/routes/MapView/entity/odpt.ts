import { array, object, optional, string, type InferOutput } from "valibot";

export const OdptTrainSchema = object({
  railway: string(),
  fromStation: string(),
  toStation: optional(string()),
  railDirection: string(),
  trainNumber: string(),
  date: string(),
});

export type OdptTrain = InferOutput<typeof OdptTrainSchema>;

export const OdptTrainResponseSchema = array(OdptTrainSchema);

export type OdptTrainResponse = InferOutput<typeof OdptTrainResponseSchema>;
