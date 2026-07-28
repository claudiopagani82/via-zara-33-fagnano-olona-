# Lightbox foto per Come raggiungerci 1/2 e Planimetrie

## Obiettivo

Nelle sezioni "Come raggiungere 1", "Come raggiungere 2" e "Planimetrie", cliccare su una foto deve aprire un'anteprima ingrandita a schermo intero. Se la sezione ha più foto, l'anteprima deve comportarsi come una gallery navigabile.

## Scope

Solo le 3 pagine sopra elencate:
- `src/app/come-raggiungerci-1/page.tsx`
- `src/app/come-raggiungerci-2/page.tsx`
- `src/app/planimetrie/page.tsx`

Nessuna altra pagina viene toccata in questa iterazione, anche se altre sezioni (APE, catasto, bollette, ecc.) usano lo stesso pattern `p.images.map(...)`. Il componente `Lightbox` viene progettato per essere riutilizzabile in futuro su quelle pagine, ma il collegamento va fatto solo se/quando richiesto.

## Architettura

Nuovo componente client `src/components/Lightbox.tsx`, presentazionale e controllato dal chiamante:

```
interface LightboxProps {
  images: string[]
  initialIndex: number
  onClose: () => void
}
```

Nessuna dipendenza esterna: costruito con React state + event handler nativi (keydown, touchstart/touchend), coerente con il pattern già usato in `Navigation.tsx` per il menu a scomparsa (incluso il blocco dello scroll del `body` mentre è aperto).

Ogni pagina mantiene la propria griglia di miniature esistente (stessi stili, stesso `object-cover`/`object-contain`, stessa struttura a griglia) — cambia solo che ogni miniatura è avvolta in un `<button>` cliccabile che apre la lightbox all'indice corrispondente. Ogni pagina tiene uno state locale `lightboxIndex: number | null` e renderizza `<Lightbox>` una sola volta, condizionato su quello state. Nessun context globale, nessuna modifica a `PhotoLayout`.

## Comportamento visivo e interazione

- Overlay fixed a schermo intero, sfondo nero semi-trasparente (~90% opacità), z-index sopra la navigazione (che usa `z-50` — la lightbox usa un valore superiore, es. `z-[60]`)
- Foto centrata, sempre `object-contain` (mai croppata), dimensionata per stare nel viewport con margine
- Header overlay: X in alto a destra per chiudere; contatore "N/M" in alto (solo se `images.length > 1`)
- Frecce sinistra/destra cliccabili ai lati della foto (nascoste se `images.length === 1`)
- Chiusura: click sulla X, click sullo sfondo scuro (fuori dalla foto), tasto ESC
- Navigazione: click frecce, frecce tastiera (`ArrowLeft`/`ArrowRight`), swipe touch orizzontale (soglia minima di distanza per evitare falsi positivi da scroll verticale)
- Body scroll bloccato (`document.body.style.overflow = 'hidden'`) mentre la lightbox è aperta, ripristinato alla chiusura/unmount
- Indice della gallery gestito internamente al componente `Lightbox` (non risale al chiamante) — il chiamante fornisce solo `initialIndex`

## Integrazione per pagina

Per ciascuna delle 3 pagine:
1. Import `Lightbox` e `useState`
2. Aggiungere `const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)`
3. Avvolgere ogni `<Image>` esistente in `p.images.map(...)` con un `<button type="button" onClick={() => setLightboxIndex(i)}>` (nessun cambio di stile del contenitore/immagine)
4. In fondo al JSX: `{lightboxIndex !== null && <Lightbox images={p.images} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />}`
5. Le 3 pagine diventano client component (`'use client'`, non lo sono attualmente) perché serve lo state locale per la lightbox. Questo non impatta il prerendering statico: le pagine non fanno fetch lato server, importano solo `property.json` (già bundlato) — Next.js le prerenderizza comunque in build e idrata lato client, come già avviene per `Navigation.tsx`

## Testing

- `npm run typecheck` e `npm run build` puliti dopo le modifiche
- Verifica manuale via browser sulle 3 pagine in locale/preview: click miniatura → apertura lightbox all'indice giusto; navigazione con frecce, tastiera, swipe simulato; chiusura con X, click esterno, ESC; nessuna regressione visiva sulle griglie di miniature esistenti
