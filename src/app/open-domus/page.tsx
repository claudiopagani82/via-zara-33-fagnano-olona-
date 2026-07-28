import Image from 'next/image'
import { PhotoLayout } from '@/components/PhotoLayout'
import property from '@/config/property.json'

const p = property.openDomus

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Image src="/images/cuore.png" alt="" width={14} height={13} className="flex-shrink-0 mt-1" />
      <span>{children}</span>
    </li>
  )
}

export default function OpenDomusPage() {
  return (
    <PhotoLayout>
      <h2 className="text-[#CC1414] font-bold uppercase text-lg text-center tracking-wide mb-3">
        {p.heading}
      </h2>

      <p className="text-[#333333] text-sm text-center mb-6 px-2">
        Open Domus non è una semplice visita, ma <em>un modo organizzato, trasparente e corretto</em> per acquistare casa.
      </p>

      <div className="bg-white/85 rounded-xl shadow-md p-6 w-full text-[#333333] text-sm leading-relaxed space-y-5">
        <div>
          <h3 className="font-bold text-[#333333] mb-2">Visiti l&apos;immobile con tranquillità</h3>
          <p>Puoi accedere <strong>liberamente</strong> alla casa, anche <em>accompagnato</em> da un tuo tecnico di fiducia (geometra, architetto, ingegnere) e valutarne con calma caratteristiche e potenzialità. Il proprietario <strong>non</strong> sarà presente durante la visita, così potrai sentirti completamente a tuo agio.</p>
        </div>

        <div>
          <h3 className="font-bold text-[#333333] mb-2">Nessuna corsa contro il tempo</h3>
          <p>Tutte le visite si svolgono nello stesso periodo. Questo significa che <strong>non perderai l&apos;immobile</strong> solo perché qualcuno ha fatto un&apos;offerta prima di te.</p>
        </div>

        <div>
          <h3 className="text-[#CC1414] font-bold uppercase text-center mb-2">Come funziona dopo la visita?</h3>
          <ul className="space-y-2">
            <Bullet>Circa <strong>30 minuti</strong> dopo l&apos;appuntamento ti invieremo un <strong className="text-[#CC1414]">Modulo di Interesse.</strong></Bullet>
            <Bullet>Il modulo <u>dovrà essere compilato</u> e inviato <strong>entro le ore 18:00 del quarto giorno successivo</strong> all&apos;Open Domus.</Bullet>
            <Bullet>Il modulo <strong><u>NON è una proposta d&apos;acquisto.</u></strong></Bullet>
            <Bullet>È solo una <u>manifestazione di interesse</u>, quindi non comporta <strong>alcun vincolo contrattuale.</strong></Bullet>
          </ul>
        </div>

        <div>
          <h3 className="text-[#CC1414] font-bold uppercase underline mb-2">Regole del processo (per garantire trasparenza)</h3>
          <ul className="space-y-2">
            <Bullet><strong>Non</strong> daremo indicazioni su quale prezzo offrire.</Bullet>
            <Bullet><strong>Potrai</strong> proporre un importo uguale o superiore al prezzo richiesto.</Bullet>
            <Bullet><strong>Non</strong> saranno accettati rialzi o modifiche <strong>dopo</strong> la firma della proposta.</Bullet>
            <Bullet><strong>Non</strong> si tratta di un&apos;asta, ma ogni partecipante deve presentare la propria <strong>migliore offerta</strong> fin da subito.</Bullet>
            <Bullet>Le offerte ricevute e le loro condizioni resteranno <strong>riservate:</strong> il consiglio è quindi di presentare fin da subito la tua migliore proposta, perché <strong>non</strong> sarà prevista una seconda possibilità.</Bullet>
          </ul>
        </div>

        <div>
          <h3 className="text-[#CC1414] font-bold uppercase text-center mb-2">Se decidi di presentare una proposta d&apos;acquisto</h3>
          <p className="mb-2">Ti verrà richiesto:</p>
          <ul className="space-y-2">
            <Bullet>Un <strong>assegno bancario di €10.000</strong> intestato al venditore, come <em>caparra confirmatoria.</em></Bullet>
            <Bullet>L&apos;assegno sarà compilato insieme a noi il giorno della proposta presso il nostro ufficio.</Bullet>
            <Bullet>Verrà custodito in deposito fiduciario fino all&apos;eventuale accettazione.</Bullet>
            <Bullet><em><u>Se non possiedi un libretto degli assegni</u>:</em> puoi richiederlo alla tua banca oppure utilizzare quello di un genitore.</Bullet>
          </ul>
        </div>

        <div>
          <h3 className="text-[#CC1414] font-bold uppercase text-center mb-2">Tempistiche importanti</h3>
          <ul className="space-y-2">
            <Bullet>Le proposte potranno essere <strong>presentate</strong> dal <strong><em><u>lunedì successivo all&apos;Open Domus</u></em></strong> fino al quinto giorno feriale incluso.</Bullet>
            <Bullet>Il <strong>proprietario</strong> valuterà <strong className="text-[#CC1414] underline">autonomamente</strong> tutte le proposte ricevute e <strong>sceglierà</strong> quella che riterrà più adatta.</Bullet>
            <Bullet>L&apos;immobile resterà in vendita <strong>fino</strong> all&apos;accettazione formale di una proposta.</Bullet>
          </ul>
        </div>
      </div>
    </PhotoLayout>
  )
}
