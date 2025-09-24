"use server";

import { DocClient, DocSSR } from "@todo/doc-next-ssr";
import { fetchDoc } from "../lib/sampleDoc";
import { ToggleMode } from "./component/toggleMode";

export default async function Page() {
  const doc = await fetchDoc();

  return (
    <div className="space-y-2 md:px-8">
      <ToggleMode />
      <DocSSR doc={doc} visuallyHidden />
      <DocClient doc={doc} />
    </div>
  );
}
