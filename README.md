# Documentation SSR & Client Renderer for Next.js

Cette bibliothèque fournit deux composants complémentaires pour Next.js :

- `DocSSR` : un rendu 100 % serveur taillé pour le SEO et les robots d'indexation. Il produit une structure HTML propre et accessible (`h1`, `h2`, `h3`, ancres `id`, liens internes…).
- `DocClient` : une version client riche (Tailwind CSS + framer-motion) qui prend le relais côté navigateur. Dès que le JavaScript est chargé, la version SSR peut être masquée pour l'utilisateur tandis que les robots continuent d'y accéder.

L'objectif est de pouvoir exposer une documentation complète à partir d'un simple JSON récupéré via `fetch`, sans configuration lourde.

## Installation

```bash
npm i @lastbrain/doc-next-ssr
# ou
pnpm add @lastbrain/doc-next-ssr
```

Ajoutez également les peer dependencies dans votre projet si elles ne sont pas encore installées :

```bash
npm install next react react-dom framer-motion
```

La bibliothèque exploite les classes Tailwind CSS. Pour une personnalisation complète, assurez-vous d'avoir Tailwind configuré dans votre application Next.js. Les classes par défaut restent utilisables sans configuration particulière, mais Tailwind permet d'aller plus loin.

## Structure des données

La documentation se base sur un objet `DocDocument` typé. Voici le format attendu :

```ts
import type { DocDocument } from "@lastbrain/doc-next-ssr";

const doc: DocDocument = {
  title: "Mon API",
  description: "Une description rapide de la ressource.",
  sections: [
    {
      id: "introduction",
      title: "Introduction",
      level: 2, // optionnel (valeur par défaut : 2)
      content: [
        "Bloc de texte en string",
        { kind: "paragraph", text: "Un autre paragraphe." },
        {
          kind: "list",
          ordered: false,
          items: ["Élément A", "Élément B"],
        },
        {
          kind: "code",
          language: "ts",
          code: 'console.log("hello")',
        },
        {
          kind: "html",
          html: "<strong>HTML contrôlé par vos soins</strong>",
        },
      ],
      children: [
        {
          id: "introduction-exemple",
          title: "Exemple",
          level: 3,
          content: ["Les sections imbriquées sont supportées."],
        },
      ],
    },
  ],
};
```

- `id` est utilisé pour créer les ancres HTML (`#introduction`).
- `level` contrôle le niveau du heading (`h2` par défaut). Les valeurs acceptées vont de 1 à 6.
- `content` est un tableau de blocs. Une simple string crée un paragraphe, tandis que les objets permettent d'ajouter des listes, du code ou du HTML personnalisé.
- `children` permet de créer des sous-sections (navigation + ancrage inclus).

## Utilisation dans une page Next.js

### 1. Rendu SSR pour le SEO

Dans un composant marqué `"use server"`, récupérez la documentation (via `fetch`, base de données, fichier JSON…) et rendez `DocSSR`.

```tsx
// app/docs/page.tsx
"use server";

import { DocSSR } from "@lastbrain/doc-next-ssr";
import { getDoc } from "@/lib/get-doc";

export default async function DocsPage() {
  const doc = await getDoc();

  return <DocSSR doc={doc} />;
}
```

Ce rendu est optimisé pour les robots : structure sémantique, sommaire avec liens internes, sections accessibles.

### 2. Hydratation client riche

Dans un composant client, réutilisez la même donnée et rendez `DocClient`. Le composant masque automatiquement l'élément SSR dès que le JavaScript est actif.

```tsx
// app/docs/client.tsx
"use client";

import { DocClient } from "@lastbrain/doc-next-ssr";
import type { DocDocument } from "@lastbrain/doc-next-ssr";

export function DocsClient({ doc }: { doc: DocDocument }) {
  return <DocClient doc={doc} />;
}
```

Ensuite, combinez les deux dans votre page :

```tsx
// app/docs/page.tsx
import { DocClient, DocSSR } from "@lastbrain/doc-next-ssr";
import { DocsClient } from "./client";
import { getDoc } from "@/lib/get-doc";

export default async function DocsPage() {
  const doc = await getDoc();

  return (
    <>
      <DocSSR doc={doc} />
      <DocsClient doc={doc} />
    </>
  );
}
```

> ℹ️ Les composants utilisent par défaut l'identifiant `doc-ssr-root`. Si vous souhaitez personnaliser l'ID de la version SSR, fournissez la même valeur dans `DocSSR` (`id`) et `DocClient` (`ssrId`).

### Résultat côté client

- Colonne gauche : sommaire interactif (`lg:w-1/4`) avec bouton menu mobile.
- Colonne droite : contenu (`lg:w-3/4`) mis en page via Tailwind (`prose`) et animations `framer-motion` (fade-in lors du scroll).
- Navigation douce (`scrollIntoView`) et surlignage de la section en cours via IntersectionObserver.

## Personnalisation

Les composants acceptent plusieurs props optionnelles :

| Prop               | Composant             | Description                                                                                                                                         |
| ------------------ | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `className`        | `DocSSR`, `DocClient` | Classes supplémentaires sur le conteneur principal.                                                                                                 |
| `visuallyHidden`   | `DocSSR`              | Rend la version SSR invisible pour les utilisateurs (utile si vous affichez immédiatement la version client) tout en restant accessible aux robots. |
| `summaryClassName` | `DocClient`           | Classes additionnelles sur la colonne du sommaire.                                                                                                  |
| `articleClassName` | `DocClient`           | Classes additionnelles sur la colonne principale.                                                                                                   |
| `smoothScroll`     | `DocClient`           | Active/désactive le scroll doux (`true` par défaut).                                                                                                |
| `ssrId`            | `DocClient`           | ID de l'élément SSR à masquer lorsqu'on passe au rendu client.                                                                                      |

Vous pouvez surcharger librement les classes Tailwind (`bg-*`, `text-*`, `prose`, etc.). Pensez à ajouter les classes personnalisées dans la `safelist` de Tailwind le cas échéant.
