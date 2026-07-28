# Documenti Condominiali PDF/Document List Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn "Documenti condominiali" from a broken photo gallery into a list of toggleable items, each linkable to a downloadable document (PDF/DOC/DOCX), editable end-to-end from the admin hub.

**Architecture:** Two repositories change together. `minisito-admintool` (the admin hub) gets its upload endpoint widened to accept `.doc`/`.docx` alongside existing image/pdf types, and its `PropertyEditor.tsx` gets a new per-item row UI (toggle + label + single-file upload) replacing the old generic array-of-strings editor for this one section. `ai-website-cloner-template` (the site template, which is also the live production repo for the current client) gets its `property.json` schema changed from `items: string[]` to `items: {label, enabled, documentUrl}[]`, and its public page rewritten to render that new shape.

**Tech Stack:** Next.js App Router, React 19, TypeScript strict, Tailwind CSS v4, GitHub Contents API (for admin hub file storage).

## Global Constraints

- List of items stays **fixed** at the current 4 entries — no add/remove-item UI in this iteration (spec: "Lista voci fissa").
- Allowed upload extensions become `['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx']` (spec: "Backend: endpoint di upload").
- Field is named `documentUrl`, not `pdfUrl` — the feature supports PDF/DOC/DOCX, not PDF-only (spec: data model).
- Replacing or removing a document only clears/overwrites the `documentUrl` reference in `property.json` — it does NOT delete the old file from the GitHub repo (spec: "Sia 'Sostituisci' che '✕'...").
- Public page: disabled item → not rendered at all. Enabled item with `documentUrl: null` → rendered greyed out, non-clickable, with "(non disponibile)". Enabled item with a `documentUrl` → clickable link, `target="_blank"`, opens in a new tab (spec: "Frontend: pagina pubblica").
- No unit test runner in either repo — verification is `npm run typecheck` + `npm run build` + manual browser checks.
- **Admin-hub testing caveat**: `minisito-admintool` has no local `.env.local` / GitHub token in this environment (established in prior sessions on this project). Tasks 1-2 (in `minisito-admintool`) can be verified locally via `npm run typecheck`, `npm run build`, and visual/interaction checks in the browser (rendering, toggling, opening the file picker) — but an actual end-to-end file upload (which calls the live GitHub API) cannot be exercised locally and must be verified after deploy, same as every prior admin-hub change in this project.

---

### Task 1: Allow `.doc`/`.docx` uploads in the admin hub's upload endpoint

**Files:**
- Modify: `C:\Users\ClaudioPagani\OneDrive\Documenti\Clienti\Domus\mini sito replicabile second test\claudecodetry\minisito-admintool\src\app\api\sites\[repo]\images\route.ts`

**Interfaces:**
- No change to the route's request/response shape — `POST` still accepts `multipart/form-data` with `file` and `section` fields, still returns `{ path: string, filename: string }`. Only the allowed-extension check changes.

- [ ] **Step 1: Widen the allowed-extensions list**

In `src/app/api/sites/[repo]/images/route.ts`, find this line:

```ts
  const allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf']
```

Replace it with:

```ts
  const allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx']
```

- [ ] **Step 2: Typecheck**

Run (from `minisito-admintool`): `npm run typecheck`
Expected: exits with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/sites/[repo]/images/route.ts
git commit -m "feat: allow doc/docx uploads alongside images and pdf"
```

---

### Task 2: New per-item editor UI for "Documenti condominiali" in PropertyEditor

**Files:**
- Modify: `C:\Users\ClaudioPagani\OneDrive\Documenti\Clienti\Domus\mini sito replicabile second test\claudecodetry\minisito-admintool\src\components\PropertyEditor.tsx`

**Interfaces:**
- Consumes: `update(path: string, value: unknown)` (existing helper, already defined in this file, sets a value at a dot/index path in the config state) and `Toggle` (existing component in this same file).
- Produces: new component `DocumentUploadField`, used only within this file's `documentiCondominiali` section block.
- Depends on: Task 1's widened `allowed` list on the backend (this task's uploads will 400 for `.doc`/`.docx` files until Task 1 ships — harmless ordering dependency, not a blocker for writing/testing this task's UI code).

- [ ] **Step 1: Add the `DocumentUploadField` component**

In `src/components/PropertyEditor.tsx`, immediately after the closing `}` of `ImageUploadField` (the function that ends at line 185, right before the `// ── Main Editor ──` comment on line 187), insert this new component:

```tsx
// ── Document Upload ──────────────────────────────────────────────────────────

function DocumentUploadField({ repo, section, documentUrl, onChange }: {
  repo: string; section: string; documentUrl: string | null; onChange: (url: string | null) => void
}) {
  const [uploading, setUploading] = useState(false)

  async function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('section', section)
    const res = await fetch(`/api/sites/${repo}/images`, { method: 'POST', body: fd })
    setUploading(false)
    if (res.ok) {
      const data = await res.json() as { path: string }
      onChange(data.path)
    }
  }

  if (documentUrl) {
    const filename = documentUrl.split('/').pop()
    return (
      <div className="flex items-center gap-2 bg-[#f4f4f5] rounded-lg px-3 py-1.5">
        <span className="text-xs font-mono text-[#71717a] flex-1 truncate">{filename}</span>
        <label htmlFor={`doc-${section}`} className="text-xs text-[#CC1414] underline cursor-pointer flex-shrink-0">
          {uploading ? '⏳' : 'Sostituisci'}
        </label>
        <input type="file" accept=".pdf,.doc,.docx" onChange={handleInput} className="hidden" id={`doc-${section}`} />
        <button
          onClick={() => onChange(null)}
          className="text-xs text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
        >
          ✕
        </button>
      </div>
    )
  }

  return (
    <div className="border-2 border-dashed border-[#e4e4e7] rounded-lg p-3 text-center hover:border-[#CC1414] transition-colors">
      <input type="file" accept=".pdf,.doc,.docx" onChange={handleInput} className="hidden" id={`doc-${section}`} />
      <label htmlFor={`doc-${section}`} className="cursor-pointer">
        {uploading
          ? <span className="text-xs text-[#71717a]">⏳ Caricamento...</span>
          : <span className="text-xs text-[#71717a]">Carica documento (PDF, DOC, DOCX)</span>
        }
      </label>
    </div>
  )
}
```

- [ ] **Step 2: Replace the "DOC. CONDOMINIALI" SectionCard body**

In the same file, find this block (currently at lines 472-478):

```tsx
        {/* DOC. CONDOMINIALI */}
        <SectionCard id="docCondominio" title="🏢 Documenti condominiali">
          {tog('documentiCondominiali.enabled')}
          {f('Titolo sezione', 'documentiCondominiali.sectionTitle')}
          {af('Elementi elenco', 'documentiCondominiali.items')}
          {imgField('doc-condominio', 'documentiCondominiali.images')}
        </SectionCard>
```

Replace it with:

```tsx
        {/* DOC. CONDOMINIALI */}
        <SectionCard id="docCondominio" title="🏢 Documenti condominiali">
          {tog('documentiCondominiali.enabled')}
          {f('Titolo sezione', 'documentiCondominiali.sectionTitle')}
          <p className="text-xs text-[#71717a] mb-4">Abilita o disabilita ogni voce e collega il documento scaricabile corrispondente.</p>
          {(c.documentiCondominiali.items as Array<{ label: string; enabled: boolean; documentUrl: string | null }>).map((item, i) => (
            <div key={i} className="grid grid-cols-[40px_1fr] items-start gap-2.5 py-2.5 border-b border-[#f0f0f0] last:border-0">
              <Toggle label="" checked={item.enabled} onChange={(v) => update(`documentiCondominiali.items.${i}.enabled`, v)} />
              <div>
                <input
                  type="text"
                  className="w-full border border-[#e4e4e7] rounded-lg px-2.5 py-1.5 text-sm bg-[#fafafa] focus:outline-none focus:border-[#CC1414] mb-2"
                  value={item.label}
                  onChange={(e) => update(`documentiCondominiali.items.${i}.label`, e.target.value)}
                />
                <DocumentUploadField
                  repo={repo}
                  section={`doc-condominio-${i}`}
                  documentUrl={item.documentUrl}
                  onChange={(url) => update(`documentiCondominiali.items.${i}.documentUrl`, url)}
                />
              </div>
            </div>
          ))}
        </SectionCard>
```

Note: this section no longer calls `af(...)` or `imgField(...)` — both helper functions remain used elsewhere in the file (by other sections), so do not remove their definitions.

- [ ] **Step 3: Typecheck**

Run (from `minisito-admintool`): `npm run typecheck`
Expected: exits with no errors. (This step will show a type error if `documentiCondominiali.items` in the property.json this editor is currently pointed at still has the OLD `string[]` shape rather than the new object shape — that's expected and will be resolved by Task 3, which updates `property.json` in the site template repo. If `npm run typecheck` fails here specifically because `c.documentiCondominiali.items` is typed from a loaded runtime config rather than a static import, this is not an error — `config` is typed as `Record<string, unknown>` and cast via `as any`/`as Array<...>`, so TypeScript will not catch a schema mismatch at this layer; it will only surface at runtime against real data, which Task 5 covers.)

- [ ] **Step 4: Manual browser verification (rendering and interaction only — no live upload)**

Run: `npm run dev` (from `minisito-admintool`; note this requires being logged in, which requires `ADMIN_USERNAME`/`ADMIN_PASSWORD` env vars — if no `.env.local` exists locally, skip this step and note it in your report; live verification will happen after deploy instead, consistent with how every other admin-hub change in this project has been verified).

If you can run it locally: open the property editor for a site, scroll to "Documenti condominiali", verify:
- 4 rows render, each with a toggle, a text input showing the item's current label, and either a dropzone ("Carica documento...") or (if `documentUrl` is already set) a filename chip with "Sostituisci"/"✕".
- Toggling a row's switch and typing in its label field updates visibly (client-side state only, no need to actually save).
- Clicking "Carica documento..." or "Sostituisci" opens the native file picker (you don't need to complete a real upload — that requires live GitHub credentials not available in this environment).

If you cannot run it locally (no credentials), state so explicitly in your report — do not mark this step as failed, note it as "deferred to production verification."

- [ ] **Step 5: Commit**

```bash
git add src/components/PropertyEditor.tsx
git commit -m "feat: per-item toggle + document upload UI for documenti condominiali"
```

---

### Task 3: Update `property.json` schema for `documentiCondominiali`

**Files:**
- Modify: `C:\Users\ClaudioPagani\OneDrive\Documenti\Clienti\Domus\mini sito replicabile second test\claudecodetry\ai-website-cloner-template\src\config\property.json`

**Interfaces:**
- Produces: the `documentiCondominiali.items` shape (`{ label: string, enabled: boolean, documentUrl: string | null }[]`) that Task 4's page component reads.

- [ ] **Step 1: Replace the `documentiCondominiali` section**

In `src/config/property.json`, find this block:

```json
  "documentiCondominiali": {
    "enabled": true,
    "sectionNumber": "",
    "sectionTitle": "DOCUMENTI CONDOMINIALI",
    "items": [
      "Regolamento condominiale",
      "Verbale ultima assemblea condominiale",
      "Piano di riparto spese condominiali",
      "Attestazione assenza morosità condominiale"
    ],
    "images": [
      "/images/doc-condominio-image1.jpg",
      "/images/doc-condominio-image2.jpg",
      "/images/doc-condominio-image3.jpg",
      "/images/doc-condominio-image4.jpg"
    ]
  },
```

Replace it with:

```json
  "documentiCondominiali": {
    "enabled": true,
    "sectionNumber": "",
    "sectionTitle": "DOCUMENTI CONDOMINIALI",
    "items": [
      { "label": "Regolamento condominiale", "enabled": true, "documentUrl": null },
      { "label": "Verbale ultima assemblea condominiale", "enabled": true, "documentUrl": null },
      { "label": "Piano di riparto spese condominiali", "enabled": true, "documentUrl": null },
      { "label": "Attestazione assenza morosità condominiale", "enabled": true, "documentUrl": null }
    ]
  },
```

Note: the `images` key is removed entirely for this section (it referenced files that were never present in the repo — a pre-existing broken reference, not something this task needs to investigate further).

- [ ] **Step 2: Validate JSON syntax**

Run (from `ai-website-cloner-template`): `node -e "JSON.parse(require('fs').readFileSync('src/config/property.json','utf8')); console.log('JSON valido')"`
Expected output: `JSON valido`

- [ ] **Step 3: Commit**

```bash
git add src/config/property.json
git commit -m "content: documentiCondominiali items become objects with enabled/documentUrl"
```

---

### Task 4: Rewrite the public "Documenti condominiali" page

**Files:**
- Modify: `C:\Users\ClaudioPagani\OneDrive\Documenti\Clienti\Domus\mini sito replicabile second test\claudecodetry\ai-website-cloner-template\src\app\documenti-condominiali\page.tsx` (full file, currently 38 lines)

**Interfaces:**
- Consumes: `property.documentiCondominiali.items` in the new shape produced by Task 3 (`{ label: string, enabled: boolean, documentUrl: string | null }[]`).

- [ ] **Step 1: Replace the file contents**

Replace the full contents of `src/app/documenti-condominiali/page.tsx` with:

```tsx
import { PhotoLayout } from '@/components/PhotoLayout'
import { RedHeartIcon } from '@/components/RedHeartIcon'
import property from '@/config/property.json'

const p = property.documentiCondominiali

export default function DocumentiCondominaliPage() {
  return (
    <PhotoLayout>
      <div className="bg-white/85 rounded-xl shadow-md p-6 w-full space-y-4">
        <h1 className="text-[#CC1414] font-bold text-xl uppercase tracking-wide">
          {p.sectionTitle}
        </h1>

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
      </div>
    </PhotoLayout>
  )
}
```

Note: this removes the `Image` import and the entire image-gallery block — this page no longer renders a photo gallery at all, only the document list.

- [ ] **Step 2: Typecheck**

Run (from `ai-website-cloner-template`): `npm run typecheck`
Expected: exits with no errors.

- [ ] **Step 3: Manual browser verification of all 3 item states**

Run: `npm run dev` (skip if already running), open `http://localhost:3000/documenti-condominiali`.

Since the default `property.json` (after Task 3) has all 4 items `enabled: true` with `documentUrl: null`, you should see all 4 items rendered greyed-out with "(non disponibile)", non-clickable.

To verify the other two states without permanently changing the committed file, temporarily edit `src/config/property.json` in your local working copy only (do not commit this temporary edit):
- Set one item's `enabled` to `false` — reload the page, confirm that item no longer appears at all.
- Set one item's `documentUrl` to `"/images/foto-principale.jpg"` (an image that does exist in `public/images/`, fine as a stand-in to test the "has a link" rendering path even though it's not really a PDF) — reload, confirm that item now renders as an underlined clickable link, and that clicking it opens the file in a new tab.

After verifying, revert `property.json` back to the committed version from Task 3 (`git checkout -- src/config/property.json`) so the temporary test edits are not left in the working tree.

- [ ] **Step 4: Commit**

```bash
git add src/app/documenti-condominiali/page.tsx
git commit -m "feat: render documenti-condominiali as toggleable document list"
```

---

### Task 5: Cross-repo verification

**Files:** none (verification only)

- [ ] **Step 1: Full build, both repos**

Run (from `ai-website-cloner-template`): `npm run build`
Expected: build completes successfully, all routes prerendered with no errors, including `/documenti-condominiali`.

Run (from `minisito-admintool`): `npm run build`
Expected: build completes successfully with no errors.

- [ ] **Step 2: Regression check on an untouched page**

Run (from `ai-website-cloner-template`): `npm run dev` (if not already running), open `http://localhost:3000/ape`.
Verify: this page (unrelated to this plan) still renders and its lightbox still works, confirming no shared code was accidentally broken.

- [ ] **Step 3: Report completion**

No commit needed for this task (verification-only). Report back:
- Whether both builds are clean.
- Whether the admin-hub UI (Task 2) could be verified locally or only visually/structurally (state explicitly which, per the Global Constraints testing caveat).
- Confirmation that the 3 item states (disabled / enabled-no-document / enabled-with-document) all render correctly on the public page (Task 4, Step 3).
- Ready for the user to decide when to push each repo, and to do a full live end-to-end verification (real file upload through the deployed admin hub) after deploy, since that step cannot be exercised in this environment.
