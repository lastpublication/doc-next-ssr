import type { DocDocument } from "@lastbrain/doc-next-ssr";

import { DocSSR } from "../../../src/server";
import { DocClient } from "../../../src/client";
import { ToggleMode } from "./component/toggleMode";

const gettingStartedDoc: DocDocument = {
  title: "Démarrer avec Lastbrain",
  description:
    "Guide rapide pour bien configurer votre espace et commencer à utiliser le SaaS.",
  sections: [
    {
      id: "introduction",
      title: "Introduction",
      level: 2,
      content: [
        "Bienvenue sur **Lastbrain**, votre espace de gestion tout-en-un.",
        {
          kind: "paragraph",
          text: "Ce guide vous aide à configurer votre compte et découvrir les principales fonctionnalités.",
        },
        {
          kind: "list",
          ordered: false,
          items: [
            "Créer un compte",
            "Configurer votre entreprise",
            "Installer vos premiers modules",
            "Accéder à votre tableau de bord",
          ],
        },
      ],
    },
    {
      id: "creation-compte",
      title: "Créer votre compte",
      level: 2,
      content: [
        {
          kind: "paragraph",
          text: "L’inscription est simple : renseignez votre email, un mot de passe et validez.",
        },
        {
          kind: "code",
          language: "bash",
          code: "curl -X POST https://api.lastbrain.io/signup \\\n -d 'email=exemple@mail.com&password=secret'",
        },
        {
          kind: "html",
          html: "<em>Astuce :</em> Vous pouvez aussi vous inscrire avec Google ou GitHub.",
        },
      ],
    },
    {
      id: "config-entreprise",
      title: "Configurer votre entreprise",
      level: 2,
      content: [
        {
          kind: "paragraph",
          text: "Après inscription, configurez les informations de base de votre société :",
        },
        {
          kind: "list",
          ordered: true,
          items: [
            "Nom de l’entreprise",
            "Numéro SIRET",
            "TVA intracommunautaire",
            "Coordonnées bancaires (optionnel)",
          ],
        },
        {
          kind: "paragraph",
          text: "Ces informations seront automatiquement utilisées dans vos devis et factures.",
        },
      ],
    },
    {
      id: "installer-modules",
      title: "Installer vos premiers modules",
      level: 2,
      content: [
        "Les modules vous permettent d’étendre les fonctionnalités de Lastbrain.",
        {
          kind: "list",
          ordered: false,
          items: [
            "Clients",
            "Devis & Factures",
            "Produits",
            "Planning de production",
          ],
        },
        {
          kind: "code",
          language: "ts",
          code: `// Exemple d’activation d’un module via API
await supabase
  .from("user_modules")
  .insert({ user_id, module: "invoice", is_active: true });`,
        },
      ],
    },
    {
      id: "tableau-de-bord",
      title: "Accéder à votre tableau de bord",
      level: 2,
      content: [
        {
          kind: "paragraph",
          text: "Votre tableau de bord regroupe toutes vos données en temps réel.",
        },
        {
          kind: "html",
          html: "<strong>Astuce :</strong> vous pouvez personnaliser l’affichage (listes, graphiques, cartes).",
        },
      ],
      children: [
        {
          id: "tableau-de-bord-exemple",
          title: "Exemple de tableau",
          level: 3,
          content: [
            {
              kind: "code",
              language: "js",
              code: `function Dashboard() {
  return <h1>Bienvenue sur votre dashboard 🚀</h1>;
}`,
            },
          ],
        },
      ],
    },
  ],
};

export default async function Page() {
  return (
    <>
      <ToggleMode />
      <div className="hidden md:max-w-[420px]" />
      <div className="md:px-8 space-y-2">
        <DocSSR visuallyHidden={true} doc={gettingStartedDoc} />
        <DocClient doc={gettingStartedDoc} />
      </div>
    </>
  );
}
