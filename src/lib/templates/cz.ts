import {
  ContractFormData,
  ContractFilmData,
} from "@/lib/types";

function formatDate(dateStr: string): string {
  if (!dateStr) return "___________";
  const d = new Date(dateStr);
  return d.toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function or(val: string | undefined | null, placeholder = "___________"): string {
  return val && val.trim() ? val : placeholder;
}

function filmTechBlock(film: ContractFilmData, index: number): string {
  return `${index + 1}. „${or(film.title)}"
   Rozlišení: ${or(film.resolution)}
   Formát: ${or(film.domemasterFormat)}
   Zvuková stopa: ${or(film.soundmix)}
   M&E verze zvuku: ${film.meVersionOfSound ? "Ano" : "Ne"}
   Délka: ${or(film.runtime)} min
   Jazyk: ${or(film.language)}`;
}

// ============================================================
// SINGLE LICENCE – FLAT FEE (CZ)
// ============================================================
function singleLicenceFlatFee(d: ContractFormData): string {
  const filmsList = d.films.map((f, i) => filmTechBlock(f, i)).join("\n\n");

  return `LICENČNÍ SMLOUVA

uzavřená mezi:

Fulldome Film Society z.s. (dále jen „Poskytovatel")
Sídlo: Vyšehradská 320/49, Nusle, 128 00 Praha 2, Česká republika
IČO: 06476317
Zastoupen: Martin Juza, ředitel

a

${or(d.clientName)} (dále jen „Nabyvatel")
Sídlo: ${or(d.clientAddress)}
IČO: ${or(d.clientBusinessId)}
DIČ: ${or(d.clientTaxId)}
Zapsán v: ${or(d.clientRegisterCourt)}, oddíl ${or(d.clientRegisterSection)}, vložka ${or(d.clientRegisterEntry)}
Zastoupen: ${or(d.clientRepresentative)}

(dále jednotlivě jako „Strana" nebo společně jako „Strany")

PREAMBULE:

Poskytovatel je spolek, jehož posláním je propagace a distribuce fulldome obsahu po celém světě. Poskytovatel disponuje potřebnými právy a oprávněními k udělení licence na níže uvedený(é) Film(y) pro fulldome projekce.

Nabyvatel provozuje fulldome kino/planetárium a přeje si získat právo na veřejné promítání Filmu(ů) ve svém zařízení.

Strany se dohodly na následujících podmínkách:

ČLÁNEK I – DEFINICE

1.1. „Film(y)" znamená následující fulldome produkci(e):
${filmsList}

1.2. „Území" znamená: ${or(d.territory)}

1.3. „Licenční období" znamená: ${d.licenseUnlimited ? "Neomezené (trvalá licence)" : `od ${formatDate(d.licenseFrom)} do ${formatDate(d.licenseTo)}`}

ČLÁNEK II – UDĚLENÍ LICENCE

2.1. Poskytovatel tímto uděluje Nabyvateli nevýhradní licenci k veřejnému promítání Filmu(ů) na Území po dobu Licenčního období.

2.2. Nabyvatel může promítat Film(y) jak veřejnému, tak školnímu/vzdělávacímu publiku na Území.

2.3. Nabyvatel nesmí bez předchozího písemného souhlasu Poskytovatele udělovat podlicence, distribuovat, kopírovat ani zpřístupňovat Film(y) třetím stranám.

2.4. Nabyvatel smí Film(y) používat výhradně pro fulldome projekci a nesmí Film(y) jakýmkoli způsobem konvertovat, upravovat ani modifikovat bez předchozího písemného souhlasu Poskytovatele.

ČLÁNEK III – LICENČNÍ POPLATEK A PLATBA

3.1. Licenční poplatek za Film(y) činí: ${or(d.feeAmount)} ${or(d.feeCurrency)} (jednorázová platba).

3.2. Licenční poplatek bude Nabyvatelem uhrazen na bankovní účet Poskytovatele do 30 dnů od podpisu této Smlouvy.

3.3. Bankovní údaje:
   Majitel účtu: Fulldome Film Society z.s.
   Banka: Fio banka, a.s.
   IBAN: CZ2120100000002902248837
   SWIFT/BIC: FIOBCZPPXXX

3.4. Veškeré platby budou provedeny bez jakýchkoli bankovních poplatků k tíži Poskytovatele. Veškeré bankovní poplatky nese Nabyvatel.

ČLÁNEK IV – DODÁNÍ

4.1. Poskytovatel dodá Film(y) Nabyvateli prostřednictvím ${d.deliveryMethod === "FTP" ? "FTP odkazu ke stažení" : "externího HDD (zaslaného na náklady Nabyvatele)"} do 14 dnů od obdržení podepsané Smlouvy a potvrzení platby.

4.2. Po dodání Nabyvatel potvrdí přijetí Filmu(ů) a ověří jejich technickou kvalitu do 7 dnů. Pokud Nabyvatel v této lhůtě neoznámí Poskytovateli žádné problémy, budou Film(y) považovány za přijaté.

ČLÁNEK V – PROPAGAČNÍ MATERIÁLY

5.1. Poskytovatel poskytne Nabyvateli dostupné propagační materiály (trailery, plakáty, fotografie) za účelem propagace promítání Filmu(ů) na Území.

5.2. Nabyvatel se zavazuje uvádět Poskytovatele a původní producenty ve všech propagačních materiálech souvisejících s Filmem(y).

ČLÁNEK VI – VÝKAZNICTVÍ

6.1. Nabyvatel poskytne Poskytovateli roční zprávy o promítání zahrnující počet projekcí a údaje o návštěvnosti, a to nejpozději do 31. ledna každého kalendářního roku za předcházející rok.

ČLÁNEK VII – UKONČENÍ

7.1. Každá Strana může tuto Smlouvu vypovědět s 90denní písemnou výpovědní lhůtou.

7.2. Poskytovatel může tuto Smlouvu okamžitě vypovědět, pokud Nabyvatel podstatně poruší jakékoliv ustanovení této Smlouvy a toto porušení nenapraví do 30 dnů od písemného upozornění.

7.3. Po ukončení Nabyvatel ukončí veškeré promítání Filmu(ů) a smaže/zničí veškeré kopie Filmu(ů) v jeho držení do 30 dnů, přičemž toto smazání písemně potvrdí Poskytovateli.

ČLÁNEK VIII – ODPOVĚDNOST A ZÁRUKY

8.1. Poskytovatel zaručuje, že má právo a oprávnění udělit licenci popsanou v této Smlouvě.

8.2. Poskytovatel neodpovídá za žádné nepřímé, následné nebo nahodilé škody vzniklé v souvislosti s používáním Filmu(ů).

8.3. Nabyvatel odpovídá výhradně za získání jakýchkoli místních povolení nebo souhlasů potřebných pro veřejné promítání.

ČLÁNEK IX – DŮVĚRNOST

9.1. Obě Strany se zavazují zachovávat důvěrnost finančních podmínek této Smlouvy a veškerých proprietárních informací vyměněných v průběhu tohoto vztahu.

ČLÁNEK X – ROZHODNÉ PRÁVO A ŘEŠENÍ SPORŮ

10.1. Tato Smlouva se řídí a vykládá v souladu s právním řádem České republiky.

10.2. Veškeré spory vyplývající z této Smlouvy budou řešeny nejprve jednáním v dobré víře. Pokud nebudou vyřešeny do 30 dnů, budou předloženy příslušným soudům České republiky.

ČLÁNEK XI – ZÁVĚREČNÁ USTANOVENÍ

11.1. Tato Smlouva představuje úplnou dohodu mezi Stranami a nahrazuje veškerá předchozí jednání, prohlášení či dohody týkající se tohoto předmětu.

11.2. Veškeré změny této Smlouvy musí být provedeny písemně a podepsány oběma Stranami.

11.3. Tato Smlouva je vyhotovena ve dvou stejnopisech, z nichž každá Strana obdrží jeden.

11.4. Tato Smlouva nabývá účinnosti podpisem obou Stran.


V Praze dne ${formatDate(d.signingDatePrague)}

_______________________________
Fulldome Film Society z.s.
Martin Juza, ředitel


V ${or(d.signingPlaceClient)} dne ${formatDate(d.signingDateClient)}

_______________________________
${or(d.clientName)}
${or(d.clientRepresentative)}`;
}

// ============================================================
// SINGLE LICENCE – INSTALLMENTS (CZ)
// ============================================================
function singleLicenceInstallments(d: ContractFormData): string {
  const base = singleLicenceFlatFee(d);

  const installmentLines = d.installments
    .map(
      (inst, i) =>
        `   ${i + 1}. ${or(inst.amount)} ${or(inst.currency)} – splatnost do ${formatDate(inst.dueDate)}`
    )
    .join("\n");

  const paymentSection = `3.1. Celkový licenční poplatek za Film(y) činí: ${or(d.feeAmount)} ${or(d.feeCurrency)}, splatný v následujících splátkách:

${installmentLines || "   (Splátky nebyly definovány)"}

3.2. Každá splátka bude Nabyvatelem uhrazena na bankovní účet Poskytovatele do příslušného data splatnosti.`;

  return base.replace(
    /3\.1\. Licenční poplatek za Film\(y\) činí:.*?\n\n3\.2\. Licenční poplatek bude.*?podpisu této Smlouvy\./s,
    paymentSection
  );
}

// ============================================================
// SINGLE LICENCE – REVENUE SHARE (CZ)
// ============================================================
function singleLicenceRevenueShare(d: ContractFormData): string {
  const filmsList = d.films.map((f, i) => filmTechBlock(f, i)).join("\n\n");

  const minGuaranteeClause = d.hasMinGuarantee
    ? `3.3. Minimální garance: Nabyvatel zaručuje minimální roční platbu ve výši ${or(d.minGuaranteeAmount)} ${or(d.minGuaranteeCurrency)} bez ohledu na skutečné dosažené příjmy. Tato částka bude uhrazena do konce každého licenčního roku.`
    : "";

  const revenueCapClause = d.hasRevenueCap
    ? `3.4. Strop příjmů: Celkové platby z podílu na příjmech nepřesáhnou ${or(d.revenueCapAmount)} ${or(d.feeCurrency)} za celé Licenční období.`
    : "";

  return `LICENČNÍ SMLOUVA (PODÍL NA PŘÍJMECH)

uzavřená mezi:

Fulldome Film Society z.s. (dále jen „Poskytovatel")
Sídlo: Vyšehradská 320/49, Nusle, 128 00 Praha 2, Česká republika
IČO: 06476317
Zastoupen: Martin Juza, ředitel

a

${or(d.clientName)} (dále jen „Nabyvatel")
Sídlo: ${or(d.clientAddress)}
IČO: ${or(d.clientBusinessId)}
DIČ: ${or(d.clientTaxId)}
Zapsán v: ${or(d.clientRegisterCourt)}, oddíl ${or(d.clientRegisterSection)}, vložka ${or(d.clientRegisterEntry)}
Zastoupen: ${or(d.clientRepresentative)}

(dále jednotlivě jako „Strana" nebo společně jako „Strany")

PREAMBULE:

Poskytovatel je spolek, jehož posláním je propagace a distribuce fulldome obsahu po celém světě. Poskytovatel disponuje potřebnými právy k udělení licence na níže uvedený(é) Film(y) pro fulldome projekce.

Nabyvatel provozuje fulldome kino/planetárium a přeje si získat právo na veřejné promítání Filmu(ů) ve svém zařízení na základě podílu na příjmech.

Strany se dohodly na následujících podmínkách:

ČLÁNEK I – DEFINICE

1.1. „Film(y)" znamená následující fulldome produkci(e):
${filmsList}

1.2. „Území" znamená: ${or(d.territory)}

1.3. „Licenční období" znamená: ${d.licenseUnlimited ? "Neomezené (trvalá licence)" : `od ${formatDate(d.licenseFrom)} do ${formatDate(d.licenseTo)}`}

1.4. „Čistý příjem" znamená hrubý příjem ze vstupného z promítání Filmu(ů), po odečtení příslušných daní a dohodnutých propagačních nákladů.

ČLÁNEK II – UDĚLENÍ LICENCE

2.1. Poskytovatel tímto uděluje Nabyvateli nevýhradní licenci k veřejnému promítání Filmu(ů) na Území po dobu Licenčního období.

2.2. Nabyvatel může promítat Film(y) jak veřejnému, tak školnímu/vzdělávacímu publiku na Území.

2.3. Nabyvatel nesmí bez předchozího písemného souhlasu Poskytovatele udělovat podlicence, distribuovat, kopírovat ani zpřístupňovat Film(y) třetím stranám.

2.4. Nabyvatel smí Film(y) používat výhradně pro fulldome projekci a nesmí Film(y) jakýmkoli způsobem konvertovat, upravovat ani modifikovat bez předchozího písemného souhlasu Poskytovatele.

ČLÁNEK III – PODÍL NA PŘÍJMECH A PLATBA

3.1. Nabyvatel bude Poskytovateli platit následující podíl z Čistého příjmu:
   - Školní/vzdělávací projekce: ${or(d.revenueShareSchool)}% z Čistého příjmu
   - Veřejné projekce: ${or(d.revenueSharePublic)}% z Čistého příjmu

3.2. Propagační náklady odečitatelné od hrubého příjmu: ${or(d.promotionalCosts)} ${or(d.feeCurrency)}

${minGuaranteeClause}

${revenueCapClause}

3.5. Platby z podílu na příjmech budou prováděny čtvrtletně, do 30 dnů po skončení každého kalendářního čtvrtletí, spolu s podrobnou zprávou o všech projekcích, návštěvnosti a příjmech.

3.6. Bankovní údaje:
   Majitel účtu: Fulldome Film Society z.s.
   Banka: Fio banka, a.s.
   IBAN: CZ2120100000002902248837
   SWIFT/BIC: FIOBCZPPXXX

3.7. Veškeré platby budou provedeny bez jakýchkoli bankovních poplatků k tíži Poskytovatele.

ČLÁNEK IV – DODÁNÍ

4.1. Poskytovatel dodá Film(y) Nabyvateli prostřednictvím ${d.deliveryMethod === "FTP" ? "FTP odkazu ke stažení" : "externího HDD (zaslaného na náklady Nabyvatele)"} do 14 dnů od obdržení podepsané Smlouvy.

4.2. Po dodání Nabyvatel potvrdí přijetí Filmu(ů) a ověří jejich technickou kvalitu do 7 dnů.

ČLÁNEK V – PROPAGAČNÍ MATERIÁLY

5.1. Poskytovatel poskytne Nabyvateli dostupné propagační materiály pro účely propagace promítání Filmu(ů) na Území.

5.2. Nabyvatel se zavazuje uvádět Poskytovatele a původní producenty ve všech propagačních materiálech.

ČLÁNEK VI – VÝKAZNICTVÍ A AUDIT

6.1. Nabyvatel poskytne Poskytovateli čtvrtletní zprávy o promítání zahrnující počet projekcí, údaje o návštěvnosti a podrobný rozpis příjmů, do 30 dnů po skončení každého kalendářního čtvrtletí.

6.2. Poskytovatel má právo provést audit záznamů Nabyvatele týkajících se promítání Filmu(ů) po přiměřeném oznámení, nejvýše jednou ročně.

ČLÁNEK VII – UKONČENÍ

7.1. Každá Strana může tuto Smlouvu vypovědět s 90denní písemnou výpovědní lhůtou.

7.2. Poskytovatel může tuto Smlouvu okamžitě vypovědět při podstatném porušení ustanovení této Smlouvy Nabyvatelem, pokud toto porušení nenapraví do 30 dnů od písemného upozornění.

7.3. Po ukončení Nabyvatel ukončí veškeré promítání, vyrovná veškeré dlužné platby z podílu na příjmech a smaže/zničí veškeré kopie Filmu(ů) do 30 dnů.

ČLÁNEK VIII – ODPOVĚDNOST A ZÁRUKY

8.1. Poskytovatel zaručuje, že má právo a oprávnění udělit licenci popsanou v této Smlouvě.

8.2. Poskytovatel neodpovídá za žádné nepřímé, následné nebo nahodilé škody.

ČLÁNEK IX – DŮVĚRNOST

9.1. Obě Strany se zavazují zachovávat důvěrnost finančních podmínek této Smlouvy.

ČLÁNEK X – ROZHODNÉ PRÁVO A ŘEŠENÍ SPORŮ

10.1. Tato Smlouva se řídí právním řádem České republiky.

10.2. Veškeré spory budou řešeny nejprve jednáním v dobré víře. Pokud nebudou vyřešeny do 30 dnů, budou předloženy příslušným soudům České republiky.

ČLÁNEK XI – ZÁVĚREČNÁ USTANOVENÍ

11.1. Tato Smlouva představuje úplnou dohodu mezi Stranami.

11.2. Veškeré změny musí být provedeny písemně a podepsány oběma Stranami.

11.3. Tato Smlouva je vyhotovena ve dvou stejnopisech.

11.4. Tato Smlouva nabývá účinnosti podpisem obou Stran.


V Praze dne ${formatDate(d.signingDatePrague)}

_______________________________
Fulldome Film Society z.s.
Martin Juza, ředitel


V ${or(d.signingPlaceClient)} dne ${formatDate(d.signingDateClient)}

_______________________________
${or(d.clientName)}
${or(d.clientRepresentative)}`;
}

// ============================================================
// ONE+ – ANNUAL ONE-TIME (CZ)
// ============================================================
function onePlusAnnual(d: ContractFormData): string {
  const filmsList = d.films.map((f, i) => filmTechBlock(f, i)).join("\n\n");

  return `SMLOUVA O PŘEDPLATNÉM ONE+ FULLDOME PROGRAMU

uzavřená mezi:

Fulldome Film Society z.s. (dále jen „Poskytovatel")
Sídlo: Vyšehradská 320/49, Nusle, 128 00 Praha 2, Česká republika
IČO: 06476317
Zastoupen: Martin Juza, ředitel

a

${or(d.clientName)} (dále jen „Předplatitel")
Sídlo: ${or(d.clientAddress)}
IČO: ${or(d.clientBusinessId)}
DIČ: ${or(d.clientTaxId)}
Zapsán v: ${or(d.clientRegisterCourt)}, oddíl ${or(d.clientRegisterSection)}, vložka ${or(d.clientRegisterEntry)}
Zastoupen: ${or(d.clientRepresentative)}

(dále jednotlivě jako „Strana" nebo společně jako „Strany")

PREAMBULE:

Poskytovatel provozuje program One+ Fulldome, který nabízí přihlášeným planetáriím a fulldome kinům přístup ke kurátorskému katalogu fulldome filmů v rámci předplatného.

Předplatitel provozuje fulldome kino/planetárium a přeje si přihlásit se k programu One+ pro přístup ke katalogu filmů.

Strany se dohodly na následujících podmínkách:

ČLÁNEK I – DEFINICE

1.1. „Program One+" znamená předplatitelskou službu fulldome filmů Poskytovatele, která poskytuje přístup ke katalogu fulldome produkcí.

1.2. „Katalog" znamená aktuální sbírku fulldome filmů dostupných v rámci programu One+, kterou může Poskytovatel průběžně aktualizovat. Aktuální katalog zahrnuje:
${filmsList}

1.3. „Území" znamená: ${or(d.territory)}

1.4. „Období předplatného" znamená: ${d.licenseUnlimited ? "Neomezené (trvalé)" : `od ${formatDate(d.licenseFrom)} do ${formatDate(d.licenseTo)}`}

ČLÁNEK II – PŘEDPLATNÉ A LICENCE

2.1. Poskytovatel tímto uděluje Předplatiteli nevýhradní licenci k veřejnému promítání filmů z Katalogu na Území po dobu Období předplatného.

2.2. Předplatitel může promítat filmy jak veřejnému, tak školnímu/vzdělávacímu publiku na Území.

2.3. S aktualizací Katalogu získá Předplatitel přístup k nově přidaným filmům bez dodatečných nákladů během aktivního Období předplatného.

2.4. Předplatitel nesmí bez předchozího písemného souhlasu Poskytovatele udělovat podlicence, distribuovat, kopírovat ani zpřístupňovat filmy třetím stranám.

2.5. Předplatitel smí filmy používat výhradně pro fulldome projekci a nesmí filmy konvertovat, upravovat ani modifikovat bez předchozího písemného souhlasu Poskytovatele.

ČLÁNEK III – POPLATEK ZA PŘEDPLATNÉ A PLATBA

3.1. Roční poplatek za předplatné činí: ${or(d.feeAmount)} ${or(d.feeCurrency)}.

3.2. Poplatek za předplatné bude hrazen ročně předem, do 30 dnů od začátku každého roku předplatného.

3.3. Bankovní údaje:
   Majitel účtu: Fulldome Film Society z.s.
   Banka: Fio banka, a.s.
   IBAN: CZ2120100000002902248837
   SWIFT/BIC: FIOBCZPPXXX

3.4. Veškeré platby budou provedeny bez jakýchkoli bankovních poplatků k tíži Poskytovatele.

ČLÁNEK IV – DODÁNÍ

4.1. Poskytovatel dodá filmy Předplatiteli prostřednictvím ${d.deliveryMethod === "FTP" ? "FTP odkazu ke stažení" : "externího HDD (zaslaného na náklady Předplatitele)"}.

4.2. Nové filmy přidané do Katalogu budou Předplatiteli zpřístupněny v přiměřené lhůtě po jejich přidání.

4.3. Po dodání Předplatitel potvrdí přijetí a ověří technickou kvalitu do 7 dnů.

ČLÁNEK V – PROPAGAČNÍ MATERIÁLY

5.1. Poskytovatel poskytne Předplatiteli dostupné propagační materiály ke každému filmu v Katalogu.

5.2. Předplatitel se zavazuje uvádět Poskytovatele a původní producenty ve všech propagačních materiálech.

ČLÁNEK VI – VÝKAZNICTVÍ

6.1. Předplatitel poskytne Poskytovateli roční zprávy o promítání zahrnující počet projekcí a údaje o návštěvnosti za každý film, nejpozději do 31. ledna každého kalendářního roku za předcházející rok.

ČLÁNEK VII – OBNOVENÍ A UKONČENÍ

7.1. Předplatné se automaticky obnovuje na následující jednoleté období, pokud některá ze Stran neposkytne písemné oznámení o neobnovení alespoň 90 dnů před koncem aktuálního Období předplatného.

7.2. Každá Strana může tuto Smlouvu vypovědět s 90denní písemnou výpovědní lhůtou.

7.3. Poskytovatel může tuto Smlouvu okamžitě vypovědět při podstatném porušení ustanovení této Smlouvy Předplatitelem.

7.4. Po ukončení nebo neobnovení Předplatitel ukončí veškeré promítání a smaže/zničí veškeré kopie filmů do 30 dnů, přičemž toto smazání písemně potvrdí.

ČLÁNEK VIII – ODPOVĚDNOST A ZÁRUKY

8.1. Poskytovatel zaručuje, že má právo a oprávnění udělit licence popsané v této Smlouvě.

8.2. Poskytovatel neodpovídá za žádné nepřímé, následné nebo nahodilé škody.

ČLÁNEK IX – DŮVĚRNOST

9.1. Obě Strany se zavazují zachovávat důvěrnost finančních podmínek této Smlouvy.

ČLÁNEK X – ROZHODNÉ PRÁVO A ŘEŠENÍ SPORŮ

10.1. Tato Smlouva se řídí právním řádem České republiky.

10.2. Veškeré spory budou řešeny nejprve jednáním v dobré víře. Pokud nebudou vyřešeny do 30 dnů, budou předloženy příslušným soudům České republiky.

ČLÁNEK XI – ZÁVĚREČNÁ USTANOVENÍ

11.1. Tato Smlouva představuje úplnou dohodu mezi Stranami.

11.2. Veškeré změny musí být provedeny písemně a podepsány oběma Stranami.

11.3. Tato Smlouva je vyhotovena ve dvou stejnopisech.

11.4. Tato Smlouva nabývá účinnosti podpisem obou Stran.


V Praze dne ${formatDate(d.signingDatePrague)}

_______________________________
Fulldome Film Society z.s.
Martin Juza, ředitel


V ${or(d.signingPlaceClient)} dne ${formatDate(d.signingDateClient)}

_______________________________
${or(d.clientName)}
${or(d.clientRepresentative)}`;
}

// ============================================================
// ONE+ – MONTHLY INSTALLMENTS (CZ)
// ============================================================
function onePlusMonthly(d: ContractFormData): string {
  const base = onePlusAnnual(d);

  const monthlyPayment = `3.1. Roční poplatek za předplatné činí: ${or(d.feeAmount)} ${or(d.feeCurrency)}, splatný v měsíčních splátkách po ${or(d.monthlyAmount)} ${or(d.feeCurrency)}.

3.2. Měsíční splátky budou Předplatitelem hrazeny do 15. dne každého kalendářního měsíce.`;

  return base.replace(
    /3\.1\. Roční poplatek za předplatné činí:.*?\n\n3\.2\. Poplatek za předplatné bude hrazen.*?roku předplatného\./s,
    monthlyPayment
  );
}

// ============================================================
// PUBLIC API
// ============================================================
export function generateContractText(data: ContractFormData): string {
  if (data.type === "SINGLE_LICENCE") {
    switch (data.paymentVariant) {
      case "FLAT_FEE":
        return singleLicenceFlatFee(data);
      case "INSTALLMENTS":
        return singleLicenceInstallments(data);
      case "REVENUE_SHARE":
        return singleLicenceRevenueShare(data);
      default:
        return singleLicenceFlatFee(data);
    }
  } else {
    switch (data.paymentVariant) {
      case "ANNUAL_ONETIME":
        return onePlusAnnual(data);
      case "MONTHLY_INSTALLMENTS":
        return onePlusMonthly(data);
      default:
        return onePlusAnnual(data);
    }
  }
}
