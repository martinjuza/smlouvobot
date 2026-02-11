import { ContractFormData } from "@/lib/types";
import { generateContractText as generateEN } from "./en";
import { generateContractText as generateCZ } from "./cz";

export function generateContractText(data: ContractFormData): string {
  if (data.language === "CZ") {
    return generateCZ(data);
  }
  return generateEN(data);
}
