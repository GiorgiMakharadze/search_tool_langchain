export type candidate = {
  answer: string;
  sources: string[];
  mode: "web" | "direct";
};

export enum Mode {
  WEB = "web",
  DIRECT = "direct",
}
