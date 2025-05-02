import { Alice } from "next/font/google";

const ACCOUNTS = [
    // 1-Aktiven: Umlaufvermögen (10)
    { name: "Kasse", aliases: ["Ka"] },
    { name: "Bank", aliases: ["Ba"] },
    { name: "Post", aliases: ["Po"] },
    { name: "Wertschriften", aliases: ["WS"] },
    { name: "Warenvorrat", aliases: ["Vorrat", "WaV"] },
    { name: "Forderungen aus Lieferungen und Leistungen", aliases: ["Ford. L+L", "FLL"] },
    { name: "Forderung Verrechnungssteuer", aliases: ["Ford. VST", "Forderung VST."] },
    { name: "Vorsteuer MWST 1170", aliases: ["Vorsteuer 1170", "Vorst. 1170"] },
    { name: "Vorsteuer MWST 1171", aliases: ["Vorsteuer 1171", "Vorst. 1171"] },
    { name: "Aktive Rechnungsabgrenzungen", aliases: ["ARA", "Aktive RA"] },

    // 1-Aktiven: Anlagevermögen (20)
    { name: "Aktivdarlehen", aliases: ["AktivD"] },
    { name: "Maschinen", aliases: ["Masch.", "Masch"] },
    { name: "Werteberichtigung Maschinen", aliases: ["WB Masch.", "WB Maschinen"] },
    { name: "Mobiliar und Einrichtungen", aliases: ["Mobiliar", "Mob"] },
    { name: "Werteberichtigung Mobiliar und Einrichtungen", aliases: ["WB Mobiliar", "WB Mob"] },
    { name: "Fahrzeuge", aliases: ["Fz"] },
    { name: "Werteberichtigung Fahrzeuge", aliases: ["WB Fahrzeuge", "WB Fz"] },
    { name: "Liegenschaften", aliases: ["Lg"] },
    { name: "Werteberichtigung Liegenschaften", aliases: ["WB Liegenschaften", "WB Lg"] },

    // 2-Passiven: Kurzfristiges Fremdkapital (20)
    { name: "Verbindlichkeiten aus Lieferungen und Leistungen", aliases: ["Verb. L+L", "VLL"] },
    { name: "Verbindlichkeiten MWST", aliases: ["Verb. MWST"] },
    { name: "Verbindlichkeiten Verechnungssteuer", aliases: ["Verb. Verechnungssteuer", "Verb. VST."] },
    { name: "Verbindlichkeiten Sozialversicherungen", aliases: ["Verb. Sozialversicherungen", "Verb. Soz. vers.", "Verb. Sozialvers."] },
    { name: "Passive Rechnungsabgrenzungen", aliases: ["Passive RA", "PRA"] },

    // 2-Passiven: Langfristiges Fremdkapital (24)
    { name: "Hypotheken", aliases: ["Hypo"] },
    { name: "Passivdarlehen", aliases: ["PassivD"] },
    { name: "Rückstellungen", aliases: ["Rs"] },

    // 2-Passiven: Eigenkapital (28)
    { name: "Eigenkapital", aliases: ["EK"] },
    { name: "Aktienkapital", aliases: ["AK"] },
    { name: "Gesetzliche Gewinnreserve", aliases: ["Ges. Gewinnres.", "Gesetzliche Gewinnres."] },
    { name: "Gewinnvortrag", aliases: [] },
    { name: "Jahresgewinn", aliases: [] },
    { name: "Privat", aliases: [] },

    // 3-Ertrag (30–39)
    { name: "Produktionserlöse", aliases: ["ProduktionsE", "ProdE"] },
    { name: "Warenerlöse", aliases: ["WarenE", "WaE"] },
    { name: "Dienstleistungserlöse", aliases: ["DLE", "DienstleistungsE"] },
    { name: "Übrige Erlöse", aliases: ["Übr. Erlöse", "Übr. E."] },
    { name: "Verluste aus Forderungen", aliases: ["Verl. Ford.", "Verl. aus Ford.", "Verluste Forderungen"] },
    { name: "Finanzertrag", aliases: ["FinE.", "FinanzE"] },
    { name: "Liegenschaftsertrag", aliases: ["LiegenschaftsE", "LgE"] },
    { name: "Dividenden", aliases: [] },
    { name: "Ausserordentlicher Ertrag", aliases: ["A.o. Ertrag", "A.o. E."] },

    // 4-Aufwand/Kosten (40–69, 80–89)
    { name: "Materialaufwand", aliases: ["MaterialA", "MA"] },
    { name: "Warenaufwand", aliases: ["WarenA", "WaA"] },
    { name: "Ausserordentlicher Aufwand", aliases: ["A.o. Aufwand", "A.o. A."] },
    { name: "Fahrzeugaufwand", aliases: ["FzA", "FahrzeugA"] },
    { name: "Sozialversicherungsaufwand", aliases: ["Soz. VersA", "Soz. Vers. Aufwand"] },
    { name: "Lohnaufwand", aliases: ["LohnA", "Lohnaufw."] },
    { name: "Übriger Personalaufwand", aliases: ["Übr. Personalaufwand", "Übr. PersA"] },
    { name: "Raumaufwand", aliases: ["RaumA"] },
    { name: "Reparaturen", aliases: [] },
    { name: "Versicherungsaufwand", aliases: ["VersA"] },
    { name: "Energieaufwand", aliases: ["EnergieA"] },
    { name: "Verwaltungsaufwand", aliases: ["VerwaltungsA", "VerwA"] },
    { name: "Werbeaufwand", aliases: ["WerbeA"] },
    { name: "Sonstiger Betriebsaufwand", aliases: ["Sonst. BA"] },
    { name: "Abschreibungen", aliases: ["Abschr."] },
    { name: "Finanzaufwand", aliases: ["FinanzA", "FinA"] },
    { name: "Liegenschaftsaufwand", aliases: ["LiegenschaftsA", "LgA"] },
    { name: "Betriebsfremder Aufwand", aliases: ["Betriebsfremder A"] }
];

export default ACCOUNTS;