import { type InferOutput, number, object, string, tuple } from "valibot";
import type { Instrument } from "../MapView.lines";

export const TrainPositionSchema = object({
  coordinates: tuple([number(), number()]),
  line: string(),
  color: string(),
  instrument: string() as ReturnType<typeof string> & { __output: Instrument },
  progress: number(),
});

export type TrainPosition = Omit<InferOutput<typeof TrainPositionSchema>, "instrument"> & {
  instrument: Instrument;
};
