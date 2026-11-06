import invoice1 from "@/app/assets/invoice-1.png";
import invoice2 from "@/app/assets/invoice-2.png";

export type Sample = { id: string; label: string; dot: string; src: string; filename: string };

export const SAMPLES: Sample[] = [
  { id: "acme", label: "Acme Solutions", dot: "bg-mint", src: invoice1.src, filename: "invoice-1.png" },
  { id: "cloudflow", label: "CloudFlow", dot: "bg-peach", src: invoice2.src, filename: "invoice-2.png" },
];

// A sample is sent exactly like an upload: its PNG, fetched and wrapped as a File.
export async function sampleFile(s: Sample): Promise<File> {
  const blob = await (await fetch(s.src)).blob();
  return new File([blob], s.filename, { type: "image/png" });
}
