# Documenti condominiali: da galleria immagini a elenco documenti scaricabili

## Obiettivo

Trasformare la sezione "Documenti condominiali" da galleria di immagini (attualmente rotta — le 4 immagini referenziate non sono mai esistite, vedi [[domus-state-2026-07-09]]) a un elenco di voci, ciascuna delle quali può essere abilitata/disabilitata e collegata a un documento scaricabile (PDF, DOC o DOCX). Il collegamento tra voce e file deve avvenire tramite il pannello admin, senza editing manuale di `property.json`.

## Repository coinvolti

- **ai-website-cloner-template** (`minisitoreplicabile`): pagina pubblica `src/app/documenti-condominiali/page.tsx`, schema `property.json`
- **minisito-admintool** (`domus-admin-hub`): editor `src/components/PropertyEditor.tsx`, endpoint upload `src/app/api/sites/[repo]/images/route.ts`

## Scope

- Lista voci **fissa** a quelle attuali (4): la segretaria può abilitare/disabilitare, rinominare l'etichetta e caricare/sostituire/rimuovere il documento di ciascuna voce. Non è possibile aggiungere o eliminare voci dalla lista tramite l'admin in questa iterazione.
- Tipi di file ammessi per il caricamento: `.pdf`, `.doc`, `.docx` (oltre ai tipi immagine già supportati dall'endpoint esistente, invariati).
- Nessuna modifica ad altre sezioni del sito o del pannello admin.

## Modello dati

`property.json`, sezione `documentiCondominiali`:

```json
"documentiCondominiali": {
  "enabled": true,
  "sectionTitle": "DOCUMENTI CONDOMINIALI",
  "items": [
    { "label": "Regolamento condominiale", "enabled": true, "documentUrl": null },
    { "label": "Verbale ultima assemblea condominiale", "enabled": true, "documentUrl": null },
    { "label": "Piano di riparto spese condominiali", "enabled": true, "documentUrl": null },
    { "label": "Attestazione assenza morosità condominiale", "enabled": true, "documentUrl": null }
  ]
}
```

Cambiamenti rispetto allo schema attuale:
- `items` passa da `string[]` a un array di oggetti `{ label: string, enabled: boolean, documentUrl: string | null }`.
- Il campo `images` di questa sezione viene rimosso interamente (era già rotto, e la nuova UX non usa più immagini per questa sezione).
- `documentUrl` è `null` finché nessun file è stato caricato per quella voce; diventa il path pubblico del file (es. `/images/doc-condominio-regolamento-1720000000000.pdf`) dopo il primo caricamento.

## Backend: endpoint di upload (minisito-admintool)

`src/app/api/sites/[repo]/images/route.ts` già gestisce upload generico di file verso `public/images/` nel repo del sito cliente, tramite GitHub Contents API. Unica modifica necessaria:

```diff
- const allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf']
+ const allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx']
```

Nessun altro cambiamento lato endpoint: il file continua a essere salvato in `public/images/{slug}-{timestamp}.{ext}` (stesso schema di naming già in uso per le immagini) e la risposta continua a restituire `{ path, filename }`.

**Perché questo elimina la classe di bug già vista due volte**: finora i mismatch tra `property.json` e i file realmente presenti (estensione o case sbagliati) nascevano da editing manuale — un umano scriveva a mano il path nel JSON. In questo flusso, il path restituito dall'endpoint viene scritto direttamente nello state React e poi salvato via `PUT /api/sites/[repo]` — nessun passaggio manuale, nessuna possibilità di errore di trascrizione.

## Frontend: pannello admin (PropertyEditor.tsx)

Sostituisce il blocco attuale (`af('Elementi elenco', ...)` + `imgField(...)`) per questa sezione con un nuovo blocco dedicato, seguendo lo stesso linguaggio visivo già usato per `navigation` (toggle + input inline) e `ImageUploadField` (drag-and-drop, stato di caricamento, rimozione):

Per ciascuna delle 4 voci, una riga con:
- **Toggle** (`enabled`) — stesso componente `Toggle` già esistente
- **Input testo** (`label`) — stesso stile degli altri campi testo brevi
- **Controllo file**, in base allo stato di `documentUrl`:
  - Se `null`: area drag-and-drop "Trascina un documento qui o sfoglia" (stesso pattern di `ImageUploadField`, ma `accept=".pdf,.doc,.docx"`, singolo file, non un array)
  - Se valorizzato: nome del file corrente + pulsante "Sostituisci" (ri-apre il file picker, sovrascrive `documentUrl` col nuovo path) + pulsante "✕" (rimuove il riferimento, riporta `documentUrl` a `null`)

Sia "Sostituisci" che "✕" agiscono solo sul riferimento in `property.json` (`documentUrl`), non cancellano il file precedente dal repo GitHub — stesso comportamento già esistente di `ImageUploadField` quando un'immagine viene rimossa dall'array. Il file vecchio resta come oggetto orfano in `public/images/`, accettabile per questa iterazione (nessuna richiesta di pulizia automatica).

Nuovo componente `DocumentUploadField` in `PropertyEditor.tsx`, analogo a `ImageUploadField` ma per singolo file invece di array — stesso endpoint (`POST /api/sites/{repo}/images`), stesso pattern di risposta.

## Frontend: pagina pubblica (documenti-condominiali/page.tsx)

Sostituisce la lista attuale (semplice mappatura di stringhe) e rimuove del tutto il blocco della galleria immagini:

```tsx
<ul className="space-y-3">
  {p.items.filter((item) => item.enabled).map((item, i) => (
    item.documentUrl ? (
      <li key={i}>
        <a
          href={item.documentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 hover:opacity-80 transition-opacity"
        >
          <RedHeartIcon size={16} className="mt-0.5" />
          <span className="text-[#333333] text-sm font-semibold underline">{item.label}</span>
        </a>
      </li>
    ) : (
      <li key={i} className="flex items-start gap-3 opacity-50">
        <RedHeartIcon size={16} className="mt-0.5" />
        <span className="text-[#333333] text-sm font-semibold">
          {item.label} <span className="text-xs italic font-normal">(non disponibile)</span>
        </span>
      </li>
    )
  ))}
</ul>
```

Comportamento:
- Voce disabilitata (`enabled: false`): non renderizzata affatto.
- Voce abilitata senza documento (`documentUrl: null`): mostrata in grigio (opacità ridotta), non cliccabile, con etichetta "(non disponibile)".
- Voce abilitata con documento: cliccabile, link sottolineato, apre il file in una nuova scheda (`target="_blank"`).

Il resto della pagina (titolo sezione, `PhotoLayout`, sfondo) resta invariato.

## Testing

Nessun test runner automatico nel repo — verifica tramite `npm run typecheck` + `npm run build` in entrambi i repository, più verifica manuale in browser:
- Pannello admin: caricare un PDF su una voce, verificare che compaia il nome file e i pulsanti Sostituisci/Rimuovi; salvare e verificare che `property.json` nel repo del sito contenga il `documentUrl` corretto.
- Sito pubblico: verificare le 3 combinazioni di stato (disabilitata → non mostrata; abilitata senza file → grigia; abilitata con file → cliccabile, apre in nuova scheda).
