import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { DEFAULT_INPUTS } from "../domain/constants";
import { SimulationInputs } from "../domain/types";

const inputsAtom = atomWithStorage<SimulationInputs>(
  "nany-cost-simulator::inputs",
  DEFAULT_INPUTS
);

export function usePersistedInputs() {
  return useAtom(inputsAtom);
}
