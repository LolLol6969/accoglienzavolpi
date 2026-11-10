/* ============================================================
   COPIONE DEL CONCIERGE
   Modifica solo questo file per cambiare cosa racconta la chat.
   - avvio: i messaggi con cui inizia la conversazione
   - argomenti: i temi tra cui il visitatore può scegliere
       id: nome interno unico, etichetta: testo del pulsante,
       messaggi: i messaggi, mostrati uno dopo l'altro
   - chiusura: l'ultimo messaggio, quando tutti i temi sono stati letti
   I testi qui sotto sono SEGNAPOSTO: sostituiscili con la storia reale.
   ============================================================ */
window.COPIONE = {
  avvio: [
    "Benvenuto. Sono il concierge di Jin Jiang.",
    "Se vuoi, ti racconto la nostra storia con calma. Da dove iniziamo?"
  ],
  argomenti: [
    {
      id: "origini",
      etichetta: "Le origini",
      messaggi: [
        "Jin Jiang nasce a Shanghai, un crocevia di culture e di viaggiatori.",
        "SEGNAPOSTO: qui andrà il racconto reale delle origini del gruppo."
      ]
    },
    {
      id: "incontro",
      etichetta: "Oriente e Occidente",
      messaggi: [
        "Da sempre uniamo la cura orientale per il dettaglio a standard di servizio internazionali.",
        "SEGNAPOSTO: qui andranno aneddoti e tappe di questo incontro."
      ]
    },
    {
      id: "oggi",
      etichetta: "Gli hotel di oggi",
      messaggi: [
        "Oggi il nome Jin Jiang accompagna indirizzi molto diversi, dal grattacielo al palazzo storico.",
        "SEGNAPOSTO: qui andrà la descrizione reale delle strutture."
      ]
    }
  ],
  chiusura: "Grazie di averci ascoltato. Se vuoi, possiamo ripartire dall'inizio."
};
