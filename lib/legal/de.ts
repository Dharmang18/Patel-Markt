import type { LegalDoc, LegalKey } from './types';

const UPDATED = '28. August 2026';

const imprint: LegalDoc = {
  title: 'Impressum',
  updated: UPDATED,
  blocks: [
    { t: 'h', text: 'Angaben gemäß § 5 DDG' },
    { t: 'todo', label: 'Vollständige Firmierung inkl. Rechtsform (z. B. „Patel Markt GmbH“ oder Inhaber-Name bei Einzelunternehmen)' },
    { t: 'p', text: 'Große Ulrichstraße 36\n06108 Halle (Saale)\nDeutschland' },
    { t: 'todo', label: 'Vertreten durch (Geschäftsführer / Inhaber)' },
    { t: 'h', text: 'Kontakt' },
    { t: 'p', text: 'Telefon: 0174 2513750\nE-Mail: info@patel-markt.de' },
    { t: 'h', text: 'Umsatzsteuer' },
    { t: 'todo', label: 'Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG (bzw. Hinweis auf Kleinunternehmerregelung nach § 19 UStG)' },
    { t: 'h', text: 'Registereintrag' },
    { t: 'todo', label: 'Registergericht und Handelsregisternummer (entfällt bei nicht eingetragenen Einzelunternehmen)' },
    { t: 'h', text: 'Verbraucherstreitbeilegung' },
    {
      t: 'p',
      text: 'Wir sind nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.',
    },
    { t: 'todo', label: 'Falls doch an einem Schlichtungsverfahren teilgenommen wird: zuständige Stelle hier benennen und den Satz oben ersetzen' },
    { t: 'h', text: 'Urheberrecht' },
    {
      t: 'p',
      text: 'Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.',
    },
    {
      t: 'p',
      text: 'Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.',
    },
    { t: 'h', text: 'Produkt- und Markennamen' },
    {
      t: 'p',
      text: 'Genannte Marken- und Produktnamen der von uns geführten Hersteller sind Eigentum der jeweiligen Rechteinhaber. Sie werden ausschließlich zur Beschreibung der von uns vertriebenen Waren verwendet.',
    },
    { t: 'h', text: 'Haftung für Links' },
    {
      t: 'p',
      text: 'Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.',
    },
  ],
};

const privacy: LegalDoc = {
  title: 'Datenschutzerklärung',
  updated: UPDATED,
  intro:
    'Soweit nachstehend keine anderen Angaben gemacht werden, ist die Bereitstellung Ihrer personenbezogenen Daten weder gesetzlich oder vertraglich vorgeschrieben, noch für einen Vertragsabschluss erforderlich. Sie sind zur Bereitstellung der Daten nicht verpflichtet. Eine Nichtbereitstellung hat keine Folgen. Dies gilt nur, soweit bei den nachfolgenden Verarbeitungsvorgängen keine anderslautende Angabe gemacht wird. „Personenbezogene Daten“ sind alle Informationen, die sich auf eine identifizierte oder identifizierbare natürliche Person beziehen.',
  blocks: [
    { t: 'h', text: 'Verantwortlicher' },
    { t: 'p', text: 'Verantwortlich für die Datenverarbeitung ist:' },
    { t: 'todo', label: 'Vollständige Firmierung inkl. Rechtsform (identisch zum Impressum)' },
    { t: 'p', text: 'Große Ulrichstraße 36, 06108 Halle (Saale), Deutschland\nTelefon: 0174 2513750\nE-Mail: info@patel-markt.de' },

    { t: 'h', text: 'Hosting und Server-Logfiles' },
    {
      t: 'p',
      text: 'Sie können unsere Website besuchen, ohne personenbezogene Daten anzugeben. Bei jedem Aufruf werden durch Ihren Browser technische Zugriffsdaten an unseren Hosting-Dienstleister übermittelt und in Server-Logfiles gespeichert. Dazu zählen etwa der Name der aufgerufenen Seite, Datum und Uhrzeit des Abrufs, die IP-Adresse, die übertragene Datenmenge sowie der anfragende Provider.',
    },
    {
      t: 'p',
      text: 'Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO aufgrund unseres berechtigten Interesses an einem störungsfreien Betrieb und an der Sicherheit unserer Website.',
    },
    {
      t: 'p',
      text: 'Unsere Website wird gehostet von Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA. Dabei können Daten in die USA übermittelt werden. Für die USA besteht mit dem EU-US Data Privacy Framework ein Angemessenheitsbeschluss der EU-Kommission.',
    },
    { t: 'todo', label: 'Prüfen und bestätigen: tatsächlicher Hosting-Anbieter und dessen Zertifizierung; ggf. Auftragsverarbeitungsvertrag (AVV) verlinken' },

    { t: 'h', text: 'Kontaktaufnahme per E-Mail, Telefon oder WhatsApp' },
    {
      t: 'p',
      text: 'Wenn Sie uns aktiv kontaktieren, erheben wir Ihre personenbezogenen Daten (Name, Kontaktdaten, Inhalt der Nachricht) nur in dem Umfang, in dem Sie diese angeben. Die Verarbeitung dient der Bearbeitung und Beantwortung Ihrer Anfrage.',
    },
    {
      t: 'p',
      text: 'Dient die Kontaktaufnahme der Durchführung vorvertraglicher Maßnahmen oder betrifft sie einen bereits geschlossenen Vertrag, erfolgt die Verarbeitung auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO. Erfolgt die Kontaktaufnahme aus anderen Gründen, erfolgt die Verarbeitung auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO aufgrund unseres berechtigten Interesses an der Bearbeitung Ihrer Anfrage. In diesem Fall haben Sie das Recht, aus Gründen, die sich aus Ihrer besonderen Situation ergeben, jederzeit Widerspruch einzulegen.',
    },

    { t: 'h', text: 'Kundenkonto' },
    {
      t: 'p',
      text: 'Wenn Sie ein Kundenkonto anlegen, erheben wir die dort angegebenen Daten (Name, E-Mail-Adresse, Telefonnummer, Anschrift). Die Verarbeitung dient der Vereinfachung Ihrer Bestellungen und der Einsicht in Ihre Bestellhistorie und erfolgt auf Grundlage Ihrer Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO. Sie können Ihre Einwilligung jederzeit uns gegenüber widerrufen; Ihr Kundenkonto wird dann gelöscht. Die Rechtmäßigkeit der bis zum Widerruf erfolgten Verarbeitung bleibt unberührt.',
    },
    {
      t: 'p',
      text: 'Konto- und Bestelldaten werden in unserer Datenbank bei der Supabase Inc., 970 Toa Payoh North, Singapur, gespeichert. Wir setzen Supabase im Rahmen einer Auftragsverarbeitung ein.',
    },
    { t: 'todo', label: 'Region des Supabase-Projekts angeben (EU oder Drittland) und den Absatz entsprechend anpassen; AVV mit Supabase abschließen' },

    { t: 'h', text: 'Bestellungen und Vertragsabwicklung' },
    {
      t: 'p',
      text: 'Bei einer Bestellung erheben und verwenden wir Ihre personenbezogenen Daten nur insoweit, als dies zur Erfüllung und Abwicklung Ihrer Bestellung sowie zur Bearbeitung Ihrer Anfragen erforderlich ist. Die Bereitstellung der Daten ist für den Vertragsschluss erforderlich; ohne sie kann kein Vertrag geschlossen werden. Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO.',
    },
    {
      t: 'p',
      text: 'Ihre Daten werden – beschränkt auf das notwendige Minimum – an Versanddienstleister, Zahlungsdienstleister und IT-Dienstleister weitergegeben.',
    },

    { t: 'h', text: 'Bestellung per WhatsApp' },
    {
      t: 'p',
      text: 'Wir bieten die Möglichkeit, eine Bestellung über ein Formular auf unserer Website abzuschicken, die anschließend als WhatsApp-Nachricht an uns übermittelt wird. Dabei werden die von Ihnen angegebenen Daten (Name, Telefonnummer, Lieferadresse, Bestellinhalt) verarbeitet.',
    },
    {
      t: 'p',
      text: 'Für den Versand dieser Nachricht nutzen wir die Dienste der Twilio Ireland Limited, 3 Dublin Landings, North Wall Quay, Dublin 1, Irland, sowie – systembedingt – der WhatsApp Ireland Limited, Merrion Road, Dublin 4, Irland. Dabei können Daten auch in die USA übermittelt werden.',
    },
    {
      t: 'p',
      text: 'Die Verarbeitung erfolgt zur Durchführung vorvertraglicher Maßnahmen bzw. zur Vertragserfüllung auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO.',
    },
    { t: 'todo', label: 'AVV mit Twilio abschließen und prüfen, ob die WhatsApp-Bestellung als eigenständiger Bestellweg in den AGB abgebildet ist' },

    { t: 'h', text: 'Zahlungsdienstleister' },
    {
      t: 'p',
      text: 'Bei Zahlung per Kredit- oder Debitkarte werden die zur Zahlungsabwicklung erforderlichen Daten an die Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower, Grand Canal Dock, Dublin, Irland, übermittelt. Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO. Weitere Informationen: https://stripe.com/de/privacy',
    },
    {
      t: 'p',
      text: 'Bei Zahlung über PayPal werden die zur Zahlungsabwicklung erforderlichen Daten an die PayPal (Europe) S.à r.l. et Cie, S.C.A., 22-24 Boulevard Royal, L-2449 Luxemburg, übermittelt. Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO. Weitere Informationen: https://www.paypal.com/de/webapps/mpp/ua/privacy-full',
    },
    {
      t: 'p',
      text: 'Bei Zahlung per Vorkasse/Überweisung werden Ihre Zahlungsdaten ausschließlich durch das von Ihnen beauftragte Kreditinstitut verarbeitet.',
    },

    { t: 'h', text: 'Versand von E-Mails zur Bestellabwicklung' },
    {
      t: 'p',
      text: 'Für den Versand von Bestellbestätigungen und vergleichbaren transaktionsbezogenen E-Mails setzen wir die Resend Inc., 2261 Market Street #5039, San Francisco, CA 94114, USA, im Rahmen einer Auftragsverarbeitung ein. Dabei werden Ihre E-Mail-Adresse und der Inhalt der Nachricht verarbeitet und in die USA übermittelt. Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO.',
    },

    { t: 'h', text: 'Auslieferung von Produktbildern' },
    {
      t: 'p',
      text: 'Die Produktbilder unseres Shops werden über die Speicher- und Auslieferungsdienste der Cloudflare Germany GmbH, Rosental 7, 80331 München (Mutterunternehmen: Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, USA) bereitgestellt. Beim Abruf eines Bildes werden technische Zugriffsdaten einschließlich Ihrer IP-Adresse verarbeitet. Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO aufgrund unseres berechtigten Interesses an einer schnellen und zuverlässigen Auslieferung unserer Website.',
    },

    { t: 'h', text: 'Cookies und lokale Speicherung' },
    {
      t: 'p',
      text: 'Wir setzen ausschließlich technisch notwendige Cookies und vergleichbare Technologien ein. Ihr Warenkorb wird im lokalen Speicher (localStorage) Ihres Browsers abgelegt, damit die ausgewählten Artikel beim Seitenwechsel erhalten bleiben. Diese Daten verbleiben in Ihrem Browser und werden nicht an uns übertragen. Sind Sie angemeldet, wird zusätzlich ein technisch notwendiges Sitzungs-Cookie gesetzt.',
    },
    {
      t: 'p',
      text: 'Der Einsatz erfolgt auf Grundlage von § 25 Abs. 2 TDDDG sowie Art. 6 Abs. 1 lit. f DSGVO aufgrund unseres berechtigten Interesses an einer funktionsfähigen Website. Sie können gespeicherte Daten jederzeit über die Einstellungen Ihres Browsers löschen.',
    },
    {
      t: 'p',
      text: 'Wir setzen derzeit keine Analyse-, Tracking- oder Werbedienste ein. Es findet keine Profilbildung und keine automatisierte Entscheidungsfindung statt. Schriftarten werden ausschließlich vom eigenen Server bzw. aus dem System des Nutzers geladen; es besteht keine Verbindung zu externen Schriftarten-Diensten.',
    },

    { t: 'h', text: 'Speicherdauer' },
    {
      t: 'p',
      text: 'Nach vollständiger Vertragsabwicklung werden die Daten zunächst für die Dauer der Gewährleistungsfrist, danach unter Berücksichtigung der gesetzlichen, insbesondere steuer- und handelsrechtlichen Aufbewahrungsfristen gespeichert und anschließend gelöscht, sofern Sie nicht in eine weitergehende Verarbeitung eingewilligt haben.',
    },

    { t: 'h', text: 'Rechte der betroffenen Person' },
    {
      t: 'p',
      text: 'Bei Vorliegen der gesetzlichen Voraussetzungen haben Sie die folgenden Rechte nach Art. 15 bis 20 DSGVO: Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung sowie Datenübertragbarkeit. Darüber hinaus steht Ihnen ein Widerspruchsrecht gegen auf Art. 6 Abs. 1 lit. f DSGVO gestützte Verarbeitungen sowie gegen die Verarbeitung zum Zwecke der Direktwerbung nach Art. 21 DSGVO zu.',
    },

    { t: 'h', text: 'Beschwerderecht bei der Aufsichtsbehörde' },
    {
      t: 'p',
      text: 'Sie haben gemäß Art. 77 DSGVO das Recht, sich bei einer Aufsichtsbehörde zu beschweren, wenn Sie der Ansicht sind, dass die Verarbeitung Ihrer Daten nicht rechtmäßig erfolgt. Die für uns zuständige Aufsichtsbehörde ist:',
    },
    {
      t: 'p',
      text: 'Landesbeauftragter für den Datenschutz Sachsen-Anhalt\nLeiterstraße 9, 39104 Magdeburg\nPostfach 1947, 39009 Magdeburg\nTelefon: +49 391 81803-0\nE-Mail: poststelle@lfd.sachsen-anhalt.de',
    },

    { t: 'h', text: 'Widerspruchsrecht' },
    {
      t: 'p',
      text: 'Beruht die hier aufgeführte Datenverarbeitung auf unseren berechtigten Interessen gemäß Art. 6 Abs. 1 lit. f DSGVO, haben Sie das Recht, aus Gründen, die sich aus Ihrer besonderen Situation ergeben, jederzeit für die Zukunft Widerspruch einzulegen. Ist der Widerspruch erfolgreich, verarbeiten wir die personenbezogenen Daten nicht mehr, es sei denn, wir können zwingende schutzwürdige Gründe für die Verarbeitung nachweisen, die Ihre Interessen, Rechte und Freiheiten überwiegen, oder die Verarbeitung dient der Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen.',
    },
  ],
};

const terms: LegalDoc = {
  title: 'Allgemeine Geschäftsbedingungen',
  updated: UPDATED,
  blocks: [
    { t: 'h', text: '§ 1 Geltungsbereich' },
    {
      t: 'p',
      text: '(1) Die nachstehenden Geschäftsbedingungen gelten für alle Verträge, die Sie mit uns als Anbieter über die Website patel-markt.de schließen. Soweit nicht anders vereinbart, wird der Einbeziehung eigener Bedingungen widersprochen.',
    },
    {
      t: 'p',
      text: '(2) Verbraucher im Sinne der nachstehenden Regelungen ist jede natürliche Person, die ein Rechtsgeschäft zu Zwecken abschließt, die überwiegend weder ihrer gewerblichen noch ihrer selbständigen beruflichen Tätigkeit zugerechnet werden können. Unternehmer ist jede natürliche oder juristische Person oder rechtsfähige Personengesellschaft, die bei Abschluss eines Rechtsgeschäfts in Ausübung ihrer gewerblichen oder selbständigen beruflichen Tätigkeit handelt.',
    },

    { t: 'h', text: '§ 2 Vertragsschluss' },
    { t: 'p', text: '(1) Gegenstand des Vertrages ist der Verkauf von Lebensmitteln und Waren des täglichen Bedarfs.' },
    {
      t: 'p',
      text: '(2) Die Darstellung der Produkte im Online-Shop stellt kein rechtlich bindendes Angebot, sondern eine Aufforderung zur Bestellung dar.',
    },
    { t: 'p', text: '(3) Der Vertragsschluss erfolgt über eines der beiden folgenden Verfahren:' },
    {
      t: 'ul',
      items: [
        'Warenkorb und Kasse: Die zum Kauf bestimmten Waren legen Sie in den Warenkorb. Nach Eingabe Ihrer Daten sowie der Zahlungs- und Versandbedingungen werden Ihnen alle Bestelldaten in einer Übersicht angezeigt. Durch Absenden der Bestellung über die entsprechende Schaltfläche geben Sie ein verbindliches Angebot ab.',
        'Bestellung per WhatsApp: Alternativ können Sie den Warenkorb über das Bestellformular als WhatsApp-Nachricht an uns übermitteln. Auch hierin liegt ein verbindliches Angebot Ihrerseits.',
      ],
    },
    {
      t: 'p',
      text: '(4) Wir können Ihr Angebot innerhalb von fünf Tagen annehmen, indem wir Ihnen eine Auftragsbestätigung in Textform übersenden oder die bestellte Ware ausliefern. Der Zugang einer automatisch erzeugten Empfangsbestätigung stellt noch keine Annahme dar.',
    },
    {
      t: 'p',
      text: '(5) Die Abwicklung der Bestellung und Übermittlung aller im Zusammenhang mit dem Vertragsschluss erforderlichen Informationen erfolgt per E-Mail teilweise automatisiert. Sie haben deshalb sicherzustellen, dass die von Ihnen hinterlegte E-Mail-Adresse zutreffend ist und der Empfang der Nachrichten technisch – insbesondere durch SPAM-Filter – nicht verhindert wird.',
    },

    { t: 'h', text: '§ 3 Preise, Versandkosten und Liefergebiet' },
    { t: 'p', text: '(1) Alle angegebenen Preise sind Endpreise und enthalten die gesetzliche Umsatzsteuer.' },
    {
      t: 'p',
      text: '(2) Zusätzlich zum Warenwert berechnen wir Versandkosten in Höhe von 4,99 €. Ab einem Bestellwert von 50 € liefern wir versandkostenfrei.',
    },
    { t: 'p', text: '(3) Wir liefern nach Deutschland, Österreich und in die Schweiz. Abgerechnet wird ausschließlich in Euro.' },
    {
      t: 'p',
      text: '(4) Bei Lieferungen in die Schweiz können zusätzliche Zölle, Steuern und Gebühren anfallen, die nicht von uns, sondern von den zuständigen Zoll- bzw. Steuerbehörden erhoben werden und von Ihnen zu tragen sind.',
    },
    { t: 'todo', label: 'Bestätigen, ob tatsächlich in die Schweiz geliefert wird, und die Zoll-/Einfuhrregelung für Lebensmittel prüfen' },

    { t: 'h', text: '§ 4 Zahlungsbedingungen' },
    {
      t: 'p',
      text: '(1) Sofern nicht anders vereinbart, sind die Zahlungsansprüche aus dem geschlossenen Vertrag sofort zur Zahlung fällig.',
    },
    {
      t: 'p',
      text: '(2) Es stehen Ihnen die im Bestellvorgang ausgewiesenen Zahlungsarten zur Verfügung, insbesondere Kredit- bzw. Debitkarte (über Stripe), PayPal sowie Überweisung.',
    },
    {
      t: 'p',
      text: '(3) Bei Zahlung per Überweisung ist der Rechnungsbetrag innerhalb von sieben Tagen nach Vertragsschluss auf das angegebene Konto zu überweisen.',
    },

    { t: 'h', text: '§ 5 Lieferung' },
    {
      t: 'p',
      text: '(1) Sofern nicht anders vereinbart, erfolgt die Lieferung an die von Ihnen angegebene Lieferadresse. Die Lieferzeit beträgt in der Regel 2 bis 4 Werktage innerhalb Deutschlands.',
    },
    {
      t: 'p',
      text: '(2) Sind Sie Verbraucher, geht die Gefahr des zufälligen Untergangs und der zufälligen Verschlechterung der verkauften Sache erst mit der Übergabe der Sache an Sie über, unabhängig davon, ob der Versand versichert erfolgt.',
    },

    { t: 'h', text: '§ 6 Eigentumsvorbehalt und Zurückbehaltungsrecht' },
    { t: 'p', text: '(1) Die Ware bleibt bis zur vollständigen Bezahlung unser Eigentum.' },
    {
      t: 'p',
      text: '(2) Ein Zurückbehaltungsrecht können Sie nur ausüben, soweit es sich um Forderungen aus demselben Vertragsverhältnis handelt.',
    },

    { t: 'h', text: '§ 7 Widerrufsrecht' },
    {
      t: 'p',
      text: '(1) Verbrauchern steht grundsätzlich ein gesetzliches Widerrufsrecht von 14 Tagen zu. Die Einzelheiten ergeben sich aus unserer Widerrufsbelehrung.',
    },
    {
      t: 'p',
      text: '(2) Das Widerrufsrecht besteht gemäß § 312g Abs. 2 Nr. 2 BGB nicht bei Verträgen zur Lieferung von Waren, die schnell verderben können oder deren Verfallsdatum schnell überschritten würde. Nach § 312g Abs. 2 Nr. 3 BGB besteht es zudem nicht bei versiegelten Waren, die aus Gründen des Gesundheitsschutzes oder der Hygiene nicht zur Rückgabe geeignet sind, wenn ihre Versiegelung nach der Lieferung entfernt wurde.',
    },
    { t: 'todo', label: 'Eigenständige Widerrufsbelehrung mit Muster-Widerrufsformular ergänzen (gesetzlich vorgeschrieben) und hier verlinken' },

    { t: 'h', text: '§ 8 Gewährleistung' },
    { t: 'p', text: '(1) Es gelten die gesetzlichen Mängelhaftungsrechte.' },
    {
      t: 'p',
      text: '(2) Als Verbraucher werden Sie gebeten, die Ware bei Lieferung umgehend auf Vollständigkeit, offensichtliche Mängel und Transportschäden zu überprüfen und uns sowie dem Transporteur Beanstandungen schnellstmöglich mitzuteilen. Kommen Sie dem nicht nach, hat dies keine Auswirkung auf Ihre gesetzlichen Gewährleistungsansprüche.',
    },
    {
      t: 'p',
      text: '(3) Bei Lebensmitteln bitten wir Sie, die Ware unmittelbar nach Erhalt zu prüfen und sachgerecht zu lagern. Für Verderb, der auf unsachgemäße Lagerung nach Übergabe zurückzuführen ist, können wir keine Haftung übernehmen.',
    },

    { t: 'h', text: '§ 9 Jugendschutz' },
    {
      t: 'p',
      text: 'Soweit wir Waren anbieten, die den Bestimmungen des Jugendschutzgesetzes unterliegen, gehen wir Vertragsbeziehungen nur mit Kundinnen und Kunden ein, die das gesetzlich vorgeschriebene Mindestalter erreicht haben. Mit Absenden Ihrer Bestellung versichern Sie, das erforderliche Mindestalter erreicht zu haben.',
    },

    { t: 'h', text: '§ 10 Rechtswahl, Erfüllungsort, Gerichtsstand' },
    {
      t: 'p',
      text: '(1) Es gilt deutsches Recht. Bei Verbrauchern gilt diese Rechtswahl nur insoweit, als dadurch nicht der Schutz entzogen wird, der durch zwingende Bestimmungen des Rechts des Staates des gewöhnlichen Aufenthaltes des Verbrauchers gewährt wird.',
    },
    {
      t: 'p',
      text: '(2) Sind Sie kein Verbraucher, sondern Unternehmer, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen, ist unser Geschäftssitz Gerichtsstand und Erfüllungsort für alle Leistungen aus den bestehenden Geschäftsbeziehungen.',
    },
    { t: 'p', text: '(3) Die Bestimmungen des UN-Kaufrechts finden ausdrücklich keine Anwendung.' },

    { t: 'h', text: 'Kundeninformationen' },
    { t: 'p', text: 'Vertragssprache ist Deutsch. Der Vertragstext wird von uns nicht gespeichert. Sie können die Vertragsdaten vor dem Absenden der Bestellung über die Druckfunktion Ihres Browsers ausdrucken oder elektronisch sichern.' },
    { t: 'p', text: 'Die wesentlichen Merkmale der Waren finden Sie in der jeweiligen Artikelbeschreibung.' },
  ],
};

export const de: Record<LegalKey, LegalDoc> = { privacy, imprint, terms };
