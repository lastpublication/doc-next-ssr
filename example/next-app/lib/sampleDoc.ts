import type { DocDocument } from "@todo/doc-next-ssr";

export const sampleDoc: DocDocument = {
  title: "Doc Next SSR Demo",
  img: "https://lastbrain.io/img/active.png",

  description:
    "Cette documentation est fournie via un fetch cote serveur et enrichie cote client avec animations et sommaire.",
  sections: [
    {
      id: "introduction",
      title: "Introduction",
      content: [
        {
          kind: "paragraph",
          text: "Ce guide montre comment utiliser le package @todo/doc-next-ssr dans un projet Next.js minimaliste.",
        },
        {
          kind: "list",
          items: [
            "Rendu SSR pour les robots",
            "Hydratation client riche avec Tailwind et framer-motion",
            "Sommaire interactif et navigation fluide",
          ],
        },
      ],
    },
    {
      id: "installation",
      title: "Installation",
      level: 2,
      content: [
        {
          kind: "paragraph",
          text: "Installez le package et configurez Tailwind pour scanner les classes utilisees par les composants.",
        },
        {
          kind: "code",
          language: "bash",
          code: "pnpm add @todo/doc-next-ssr framer-motion",
        },
      ],
      children: [
        {
          id: "tailwind-config",
          title: "Configuration Tailwind",
          level: 3,
          content: [
            {
              kind: "paragraph",
              text: "Mettez a jour tailwind.config pour inclure node_modules/@todo/doc-next-ssr/dist/**/*.js dans content.",
            },
          ],
        },
      ],
    },
    {
      id: "utilisation",
      title: "Utilisation de base",
      level: 2,
      content: [
        {
          kind: "paragraph",
          text: "Les composants DocSSR et DocClient acceptent la meme doc et se synchronisent via l'ID SSR.",
        },
        {
          kind: "code",
          language: "tsx",
          code: "<DocSSR doc={doc} visuallyHidden />\n<DocClient doc={doc} />",
        },
      ],
    },
    {
      id: "customisation",
      title: "Personnalisation1",
      level: 2,
      content: [
        {
          kind: "paragraph",
          text: "Utilisez les props className, summaryClassName et articleClassName sur DocClient pour adapter le layout.",
        },
        {
          kind: "html",
          html: "<p>Les blocs HTML personnalises sont rendus tels quels.</p>",
        },
      ],
    },
    {
      id: "customisation2",
      title: "Personnalisation2",
      level: 2,
      content: [
        {
          kind: "paragraph",
          text: "Utilisez les props className, summaryClassName et articleClassName sur DocClient pour adapter le layout.",
        },
        {
          kind: "html",
          html: "<p>Les blocs HTML personnalises sont rendus tels quels.</p>",
        },
      ],
    },
    {
      id: "customisation3",
      title: "Personnalisation3",
      level: 2,
      content: [
        {
          kind: "paragraph",
          text: "Utilisez les props className, summaryClassName et articleClassName sur DocClient pour adapter le layout.",
        },
        {
          kind: "html",
          html: "<p>Les blocs HTML personnalises sont rendus tels quels.</p>",
        },
      ],
    },
    {
      id: "customisation4",
      title: "Personnalisation4",
      level: 3,
      content: [
        {
          kind: "paragraph",
          text: "Utilisez les props className, summaryClassName et articleClassName sur DocClient pour adapter le layout.",
        },
        {
          kind: "html",
          html: "<p>Les blocs HTML personnalises sont rendus tels quels.</p>",
        },
      ],
    },
    {
      id: "customisation5",
      title: "Personnalisation5",
      level: 2,
      content: [
        {
          kind: "paragraph",
          text: "Utilisez les props className, summaryClassName et articleClassName sur DocClient pour adapter le layout.",
        },
        {
          kind: "html",
          html: "<p>Les blocs HTML personnalises sont rendus tels quels.</p>",
        },
      ],
    },
  ],
};

export async function fetchDoc(): Promise<DocDocument> {
  // Simule un appel reseau cote serveur.
  await new Promise((resolve) => setTimeout(resolve, 100));
  return sampleDoc;
}
