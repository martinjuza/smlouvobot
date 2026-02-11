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

function or(
  val: string | undefined | null,
  placeholder = "___________"
): string {
  return val && val.trim() ? val : placeholder;
}

// ============================================================
// SHARED: Parties block (Article I)
// ============================================================
function partiesBlock(d: ContractFormData): string {
  return `I.
Smluvní strany

Krutart s.r.o.
se sídlem Karlovo náměstí 557/30, Nové Město, 120 00 Praha 2, Česká republika
zapsaná v obchodním rejstříku vedeném Městským soudem v Praze, oddíl C, vložka 233141
IČ: 035 33 450, DIČ: CZ03533450
Číslo účtu:
IBAN:
SWIFT: KOMBCZPPXXX
zastoupená MgA. Martinem Jůzou, jednatelem
(dále jen „Krutart")

a

${or(d.clientName)}
se sídlem: ${or(d.clientAddress)}
IČ: ${or(d.clientBusinessId)}
DIČ: ${or(d.clientTaxId)}
zastoupená ${or(d.clientRepresentative)}
(dále jen „klient")

uzavírají tuto

licenční smlouvu`;
}

// ============================================================
// SHARED: Film tech block for Single Licence (Article III §2)
// ============================================================
function singleFilmTechBlock(
  film: ContractFilmData,
  deliveryMethod: string
): string {
  return `a) Kopie filmu
   − Technické specifikace kopie:
      − rozlišení: ${or(film.resolution)}
      − formát domemaster: ${or(film.domemasterFormat)}
      − zvuková stopa: ${or(film.soundmix)}
      − ME verze zvuku: ${film.meVersionOfSound ? "Ano" : "Ne"}
      − délka: ${or(film.runtime)} min
      − jazyk: ${or(film.language)}
   − Způsob a datum zpřístupnění kopie:
      − Společnost Krutart je povinna poskytnout kopii filmu klientovi nejpozději do 14 dnů od podpisu této licenční smlouvy.
      − ${deliveryMethod === "FTP" ? "Krutart poskytne klientovi přístup ke svému FTP serveru, aby si mohl kopii filmu bezplatně stáhnout." : "Krutart dodá klientovi fyzický pevný disk obsahující kopii filmu za dodatečný manipulační poplatek ve výši 300 $."}

b) Další materiály
   − Specifikace dalších materiálů:
      − upoutávka ve flat a fulldome verzi
      − propagační materiály (plakáty atd.)
   − Způsob a datum poskytnutí materiálů:
      − Společnost Krutart je povinna poskytnout další materiály klientovi nejpozději do 14 dnů od podpisu této licenční smlouvy.
      − Krutart dodá marketingové materiály klientovi stejným způsobem, jaký byl zvolen pro dodání filmu (buď prostřednictvím FTP, nebo na fyzickém pevném disku).`;
}

// ============================================================
// SINGLE LICENCE: Base (Articles I–III)
// ============================================================
function singleLicenceBase(d: ContractFormData): string {
  const film = d.films[0];
  const filmInfo =
    d.films.length > 1
      ? d.films
          .map(
            (f, i) =>
              `   ${i + 1}. název: ${or(f.title)}, režisér(ři): ${or(f.directors)}, rok výroby: ${or(f.yearOfProduction)}`
          )
          .join("\n")
      : `   název: ${or(film?.title)}, režisér(ři): ${or(film?.directors)}, rok výroby: ${or(film?.yearOfProduction)}`;

  const filmLabel =
    d.films.length > 1 ? "audiovizuální díla" : "audiovizuální dílo";
  const filmRef =
    d.films.length > 1 ? '(dále jen „filmy")' : '(dále jen „film")';

  const filmTechBlocks = d.films
    .map((f, i) => {
      const prefix =
        d.films.length > 1 ? `Film ${i + 1}: „${or(f.title)}"\n` : "";
      return prefix + singleFilmTechBlock(f, d.deliveryMethod);
    })
    .join("\n\n");

  const licenseTimeFrame = d.licenseUnlimited
    ? "bez omezení (tj. na celou dobu trvání práv k filmu)"
    : `od ${formatDate(d.licenseFrom)} do ${formatDate(d.licenseTo)}`;

  return `LICENČNÍ SMLOUVA

${partiesBlock(d)}

II.
Předmět smlouvy

1. Společnost Krutart je profesionálním producentem filmů, seriálů a dalších audiovizuálních a multimediálních obsahů. Společnost Krutart vyrobila následující ${filmLabel}:
${filmInfo}
   ${filmRef}.
2. Klient si přeje získat souhlas společnosti Krutart k použití filmu definovaného v této smlouvě za podmínek uvedených v této smlouvě.
3. Kromě konkrétních podmínek stanovených v této smlouvě se vztah mezi stranami řídí také všeobecnými podmínkami připojenými k této smlouvě jako příloha č. 1.

III.
Licence

1. Společnost Krutart tímto uděluje klientovi oprávnění k použití filmu (licenci) v rozsahu stanoveném níže:
   − pro následující způsoby použití:
      − sdílení filmu v nehmotné podobě veřejnosti formou provozování ze záznamu (práva na promítání v kinech),
      − vytváření kopií filmu za výše uvedeným účelem;
   − v následujícím časovém rámci: ${licenseTimeFrame}
   − na následujícím území (země a/nebo konkrétní planetárium): ${or(d.territory)} (dále jen „planetárium");
   − v následujícím rozsahu (počet promítání): bez omezení;
   − nevýhradně, tj. společnost Krutart není omezena v možnosti sama film užívat nebo umožnit jeho užití jiným osobám za výše uvedených podmínek.

2. Za účelem řádného využití licence podle této smlouvy je společnost Krutart povinna poskytnout klientovi následující materiály a klient je oprávněn je používat v souvislosti s využíváním filmu za výše uvedených licenčních podmínek:

${filmTechBlocks}`;
}

// ============================================================
// SINGLE LICENCE: Payment – Flat Fee
// ============================================================
function singlePaymentFlatFee(d: ContractFormData): string {
  return `IV.
Odměna

1. Klient je povinen zaplatit společnosti Krutart poplatek za poskytnutí licence podle této smlouvy v celkové výši ${or(d.feeAmount)} ${or(d.feeCurrency)} bez DPH.

2. Licenční poplatek uvedený v předchozím odstavci bude uhrazen na bankovní účet společnosti Krutart uvedený v záhlaví této smlouvy nejpozději do 14 dnů od podpisu této smlouvy na základě příslušného daňového dokladu – faktury společnosti Krutart.`;
}

// ============================================================
// SINGLE LICENCE: Payment – Installments
// ============================================================
function singlePaymentInstallments(d: ContractFormData): string {
  const installmentLines = d.installments
    .map(
      (inst, i) =>
        `   − ${i + 1}. splátka ve výši ${or(inst.amount)} ${or(inst.currency)} bez DPH bude uhrazena společnosti Krutart nejpozději do ${formatDate(inst.dueDate)};`
    )
    .join("\n");

  return `IV.
Odměna

1. Klient je povinen zaplatit společnosti Krutart poplatek za poskytnutí licence podle této smlouvy v celkové výši ${or(d.feeAmount)} ${or(d.feeCurrency)} bez DPH.

2. Licenční poplatek uvedený v předchozím odstavci bude uhrazen na bankovní účet společnosti Krutart uvedený v záhlaví této smlouvy na základě příslušných daňových dokladů – faktur společnosti Krutart, a to v následujících splátkách:

${installmentLines || "   (Splátky nebyly definovány)"}`;
}

// ============================================================
// SINGLE LICENCE: Payment – Revenue Share
// ============================================================
function singlePaymentRevenueShare(d: ContractFormData): string {
  let minGuaranteeClause = "";

  if (d.hasMinGuarantee && !d.hasRevenueCap) {
    minGuaranteeClause = `

3. Strany se dohodly, že za celou dobu trvání licence poskytne klient společnosti Krutart podílovou odměnu v celkové výši minimálně ${or(d.minGuaranteeAmount)} ${or(d.minGuaranteeCurrency)} (minimální garance). Pokud výsledný součet podílových odměn nedosáhne výše minimální garance uvedené v předchozí větě, je společnost Krutart oprávněna účtovat klientovi v poslední faktuře zaslané klientovi po skončení licenčního období doplatek ve výši odpovídající rozdílu mezi výší sjednané minimální garance a výší celkové dosud uhrazené podílové odměny.`;
  } else if (d.hasMinGuarantee && d.hasRevenueCap) {
    minGuaranteeClause = `

3. Strany se dohodly, že za celou dobu trvání licence klient poskytne společnosti Krutart podílovou odměnu v celkové výši minimálně ${or(d.minGuaranteeAmount)} ${or(d.minGuaranteeCurrency)} (minimální garance). Pokud výsledný součet podílových odměn nedosáhne výše minimální garance uvedené v předchozí větě, je společnost Krutart oprávněna účtovat klientovi v poslední faktuře zaslané klientovi po skončení licenčního období doplatek ve výši odpovídající rozdílu mezi výší sjednané minimální garance a výší celkové dosud uhrazené podílové odměny. Strany se zároveň dohodly, že klient neuhradí společnosti Krutart v souhrnu více než ${or(d.revenueCapAmount)} ${or(d.feeCurrency)} jako podíl na výnosech. Pokud tedy výše podílu na výnosech kdykoli během platnosti licence dosáhne uvedené částky a tato částka bude společnosti Krutart řádně uhrazena, není společnost Krutart oprávněna požadovat od klienta žádný další podíl na výnosech ani paušální poplatek za poskytnutí licence podle této smlouvy.`;
  }

  return `IV.
Odměna

1. Klient je povinen zaplatit společnosti Krutart podíl za poskytnutí licence podle této smlouvy ve výši:
   − ${or(d.revenueShareSchool)} % z ceny každé prodané vstupenky v případě speciálních projekcí filmu pro školy;
   − ${or(d.revenueSharePublic)} % z ceny každé prodané vstupenky v případě promítání filmu pro širokou veřejnost.

   Klient odečte DPH (pokud je uplatnitelná) z ceny každé vstupenky před výpočtem podílu pro společnost Krutart.

   Zároveň se strany dohodly, že společnost Krutart má nárok na podíl pouze od okamžiku, kdy jeho celková výše přesáhne náklady klienta na propagaci a distribuci dohodnuté na pevnou paušální částku ve výši ${or(d.promotionalCosts)} ${or(d.feeCurrency)}.

2. Klient je povinen zaslat na e-mailovou adresu společnosti Krutart krutart@krutart.cz písemné podrobné vyúčtování podílu za uplynulé kalendářní čtvrtletí; toto vyúčtování musí být vždy zasláno během prvních 15 dnů následujícího kalendářního čtvrtletí. Na základě tohoto vyúčtování vystaví společnost Krutart klientovi fakturu za podíl za předchozí čtvrtletí. K této odměně bude připočtena odpovídající DPH. Poplatek za podíl zaplatí klient společnosti Krutart na základě vystavené faktury, a to nejpozději do 15 dnů od jejího vystavení. V případě, že se klient zpozdí se zasláním řádného podrobného písemného výkazu poplatku za podíl o více než 30 dnů, je společnost Krutart oprávněna v každém takovém případě účtovat klientovi smluvní pokutu ve výši 2000 Kč za každý den prodlení a zároveň je společnost Krutart oprávněna tuto smlouvu jednostranně ukončit odstoupením; takové odstoupení od smlouvy nemá vliv na právo společnosti Krutart na uvedenou smluvní pokutu.${minGuaranteeClause}`;
}

// ============================================================
// SINGLE LICENCE: Signatures + Annex (GTC)
// ============================================================
function singleLicenceClosing(d: ContractFormData): string {
  return `

Strany prohlašují, že porozuměly obsahu této smlouvy a souhlasí s ním, a to jak v celku, tak v jednotlivých ustanoveních, na důkaz čehož připojují své podpisy:

Přílohy: Příloha č. 1: Všeobecné obchodní podmínky


V Praze dne ${formatDate(d.signingDatePrague)}

Krutart:

___________________________
Krutart s.r.o.
MgA. Martin Jůza, jednatel


V ${or(d.signingPlaceClient)} dne ${formatDate(d.signingDateClient)}

Klient:

___________________________
${or(d.clientName)}
${or(d.clientRepresentative)}


${singleGTC()}`;
}

// ============================================================
// SINGLE LICENCE: General Terms and Conditions (Annex 1)
// ============================================================
function singleGTC(): string {
  return `Příloha č. 1
k licenční smlouvě

Všeobecné obchodní podmínky

a) Obecné licenční podmínky

1. Souhlas s použitím filmu poskytnutý na základě této smlouvy zahrnuje následující typy souhlasů:
   a. souhlas s užitím zvukově obrazového záznamu filmu;
   b. souhlas s užitím filmu jako autorského díla jeho režiséra;
   c. souhlas s užitím autorských děl a uměleckých výkonů použitých ve filmu
   (všechny typy souhlasů podle tohoto ustanovení pro účely této smlouvy jsou dále společně označovány jako „licence").

2. Klient je oprávněn používat snímky obrazovky nebo výňatky z filmu (v celkové délce nejvýše 2 minuty) k výrobě propagačních materiálů určených k oznámení použití filmu za podmínek stanovených v této smlouvě a používat tyto materiály v obvyklém rozsahu. Klient však bere na vědomí, že ani takové použití částí filmu nesmí mít vliv na uměleckou hodnotu filmu.

3. Klient je povinen ve všech propagačních materiálech týkajících se použití filmu podle smlouvy vhodným způsobem uvést, že Krutart je držitelem autorských práv k filmu, např. ve formě symbolu vyhrazených autorských práv nebo loga Krutart (například: © Krutart).

4. Klient není oprávněn provádět žádné změny, úpravy, doplňky, spojení nebo jiné zásahy do filmu, pokud k tomu společnost Krutart neudělí výslovný písemný souhlas.

5. Klient není oprávněn udělovat další sublicence ani jiným způsobem převádět práva z licence na třetí osoby.

6. Po uplynutí sjednané doby platnosti licence je klient povinen neprodleně smazat všechny soubory obsahující film a doprovodné materiály, ukončit veškeré používání filmu a odstranit jej ze svého programu. Na žádost společnosti Krutart je klient povinen písemně potvrdit, že tyto povinnosti splnil. V případě porušení těchto povinností ze strany klienta je společnost Krutart oprávněna v každém případě požadovat od klienta smluvní pokutu ve výši rovnající se celkovému licenčnímu poplatku zaplacenému klientem společnosti Krutart podle článku IV této smlouvy.

b) Překlad filmu

7. Klient je oprávněn vytvořit dabovanou verzi nebo titulky k filmu při použití licence podle smlouvy.

8. Klient je povinen poskytnout každý takový překlad (tj. titulky a/nebo dabing) společnosti Krutart na vhodném médiu (potvrzeném společností Krutart) bez zbytečného odkladu po jeho vytvoření, nejpozději však do 1 měsíce od tohoto okamžiku.

9. Pokud jde o výrobu titulků: Klient tímto bezplatně uděluje společnosti Krutart oprávnění k použití každého takového titulku v souvislosti s filmem bez (územního, časového nebo jiného) omezení, ale vždy mimo planetárium (práva k použití titulků v planetáriu náleží výlučně klientovi); společnost Krutart je oprávněna tato práva sublicencovat třetím stranám.

10. Pokud jde o výrobu dabingu: Klient je povinen dodržovat technické parametry týkající se dabingu a stanovené společností Krutart v protokolu, který bude klientovi za tímto účelem poskytnut společností Krutart. Klient je rovněž povinen poskytnout společnosti Krutart rozpočet na výrobu dabingu před zahájením výroby dabingu. Pokud po přijetí finálního dabingu od klienta (viz odstavec 8 výše) společnost Krutart potvrdí, že dabing splňuje stanovené technické parametry, je společnost Krutart oprávněna (nikoli však povinna) požádat klienta o udělení licence na tento dabing, která bude zahrnovat oprávnění k použití tohoto dabingu v souvislosti s filmem bez (územních, časových nebo jiných) omezení, avšak vždy mimo planetárium (práva na použití dabingu v planetáriu zůstávají výlučně klientovi); společnost Krutart je oprávněna tato práva sublicencovat třetím stranám. Pokud bude na žádost společnosti Krutart udělena licence k dabingu v souladu s předchozí větou, zavazuje se společnost Krutart poskytnout klientovi slevu z ceny licence k filmu uvedené v článku IV smlouvy ve výši 1/2 dohodnutého rozpočtu na výrobu dabingu.

11. Klient je v každém případě povinen vypořádat práva třetích osob k jednotlivým překladům (včetně práv hlasových umělců v případě dabingu, pokud bude licence k dabingu udělena, viz odstavec 10 výše) svým jménem, na své náklady a v rozsahu, který mu umožňuje udělit příslušnou licenci společnosti Krutart v souladu s výše uvedenými podmínkami.

c) Sankce za opožděné platby

12. V případě, že se klient zpozdí s platbou odměny podle této smlouvy, zavazuje se zaplatit společnosti Krutart úrok z prodlení ve výši 0,05 % za každý celý den prodlení.

13. V případě, že se klient opozdí s platbou jakékoli části odměny o více než 30 dní, je společnost Krutart oprávněna od smlouvy odstoupit s okamžitou účinností. V takovém případě zůstává právo na úrok z prodlení vzniklý do okamžiku odstoupení od této smlouvy společnosti Krutart. Pro vyloučení pochybností se sjednává, že odstoupení od smlouvy nebo zaplacení úroků z prodlení nemá vliv na právo společnosti Krutart na zaplacení původní dlužné částky.

d) Různé

14. Smlouva se řídí právními předpisy České republiky. Veškeré spory budou řešeny soudem s věcnou příslušností v České republice; územní příslušnost soudu se určí podle sídla společnosti Krutart.

15. Obsah smlouvy je důvěrný, včetně všech finančních ujednání a dohodnutého rozsahu a podmínek licence.

16. Změny smlouvy musí být provedeny písemnou formou (což pro účely tohoto ustanovení nezahrnuje elektronickou komunikaci) a podpisy zástupců obou stran musí být na stejném dokumentu.

17. Odpověď strany podle § 1740 odst. 3 občanského zákoníku obsahující změnu nebo odchylku nepředstavuje přijetí nabídky k uzavření smlouvy, i když se podmínky nabídky podstatně nemění.`;
}

// ============================================================
// SINGLE LICENCE: Combined generators
// ============================================================
function singleLicenceFlatFee(d: ContractFormData): string {
  return (
    singleLicenceBase(d) +
    "\n\n" +
    singlePaymentFlatFee(d) +
    singleLicenceClosing(d)
  );
}

function singleLicenceInstallments(d: ContractFormData): string {
  return (
    singleLicenceBase(d) +
    "\n\n" +
    singlePaymentInstallments(d) +
    singleLicenceClosing(d)
  );
}

function singleLicenceRevenueShare(d: ContractFormData): string {
  return (
    singleLicenceBase(d) +
    "\n\n" +
    singlePaymentRevenueShare(d) +
    singleLicenceClosing(d)
  );
}

// ============================================================
// ONE+: Film catalogue entry (for Annex 1)
// ============================================================
function onePlusFilmCatalogueEntry(
  film: ContractFilmData,
  index: number,
  deliveryMethod: string
): string {
  return `${index + 1}. název: ${or(film.title)}, režisér(ři): ${or(film.directors)}, rok výroby: ${or(film.yearOfProduction)}

   a) Kopie filmu
      − Technické specifikace kopie:
         − rozlišení: ${or(film.resolution)}
         − formát domemasteru: ${or(film.domemasterFormat)}
         − zvuková stopa: ${or(film.soundmix)}
         − ME verze zvuku: ${film.meVersionOfSound ? "Ano" : "Ne"}
         − délka: ${or(film.runtime)} min
         − jazyk: ${or(film.language)}
      − Způsob a datum zpřístupnění kopie:
         − Společnost Krutart je povinna poskytnout kopii filmu klientovi nejpozději do 14 dnů od podpisu licenční smlouvy.
         − ${deliveryMethod === "FTP" ? "Krutart poskytne klientovi přístup ke svému FTP serveru, aby si mohl kopii filmu bezplatně stáhnout." : "Krutart dodá klientovi fyzický pevný disk obsahující kopii filmu za dodatečný manipulační poplatek ve výši 300 $."}

   b) Další materiály
      − Specifikace dalších materiálů:
         − upoutávka ve flat a fulldome verzi
         − propagační materiály (plakát atd.)
      − Způsob a datum zpřístupnění materiálů:
         − Společnost Krutart je povinna poskytnout další materiály klientovi nejpozději do 14 dnů od podpisu licenční smlouvy.
         − Krutart dodá marketingové materiály klientovi stejným způsobem, jaký byl zvolen pro dodání filmu (buď prostřednictvím FTP, nebo na fyzickém pevném disku).`;
}

// ============================================================
// ONE+: Base (Articles I–III)
// ============================================================
function onePlusBase(d: ContractFormData): string {
  const licenseFrom = formatDate(d.licenseFrom);
  const licenseTo = formatDate(d.licenseTo);

  return `LICENČNÍ SMLOUVA

${partiesBlock(d)}

II.
Předmět smlouvy

1. Společnost Krutart je profesionálním producentem filmů, seriálů a dalších audiovizuálních a multimediálních obsahů. Společnost Krutart vyrobila audiovizuální díla uvedená v příloze č. 1 této smlouvy (dále jen „filmy"). Pro účely této smlouvy zahrnuje pojem „filmy" kromě filmů uvedených v příloze č. 1 také všechny ostatní fulldome filmy, jejichž produkci společnost Krutart dokončí během dohodnuté licenční doby (za kterou klient zaplatil předplatné podle článku IV.), jak je uvedeno v článku III, odstavci 1. Společnost Krutart se zavazuje informovat klienta e-mailem na adresu ${or(d.clientEmail)} o všech filmech, které budou nově vyrobeny společností Krutart během dohodnuté licenční doby, přičemž společnost Krutart poskytne klientovi podrobné informace o každém takovém novém filmu, včetně specifikací jeho kopie a specifikací dalších souvisejících materiálů (analogicky k tomu, jak jsou tyto specifikace uvedeny pro stávající filmy v příloze č. 1 této smlouvy). Klient bere na vědomí, že společnost Krutart nezaručuje konkrétní nebo minimální počet nově vyrobených filmů během licenční doby.

2. Klient si přeje získat souhlas společnosti Krutart k použití filmů definovaných v této smlouvě za podmínek uvedených v této smlouvě. Licence udělená touto smlouvou se vztahuje na předplacenou službu společnosti Krutart s názvem Krutart One+.

3. Kromě konkrétních podmínek stanovených v této smlouvě se vztah mezi stranami řídí také všeobecnými podmínkami připojenými k této smlouvě jako příloha č. 2.

III.
Licence

1. Společnost Krutart tímto uděluje klientovi oprávnění k použití filmů (licenci) v rozsahu stanoveném níže:
   − pro následující způsoby použití:
      − sdílení filmů v nehmotné podobě veřejnosti formou provozování ze záznamu (práva na promítání v kinech),
      − vytváření kopií filmů za výše uvedeným účelem;
   − v následujícím časovém rámci: 24 měsíců, konkrétně od ${licenseFrom} do ${licenseTo}; pokud nejpozději 30 dní před koncem sjednané doby platnosti licence žádná ze stran této smlouvy neoznámí druhé straně písemně (alespoň e-mailem) svůj záměr tuto smlouvu vypovědět, doba platnosti licence se automaticky prodlouží o dalších 12 měsíců, a to i opakovaně, tj. toto automatické prodlužování bude pokračovat, dokud jedna ze stran neoznámí druhé straně dohodnutým způsobem svůj záměr ukončit smlouvu na konci aktuálního licenčního období; společnost Krutart se zavazuje vždy písemně (e-mailem) nejméně 45 dní před koncem aktuálního licenčního období informovat klienta o blížícím se konci tohoto licenčního období;
   − na následujícím území – kupole/planetárium/mobilní projekční jednotka: ${or(d.territory)} (dále jen „planetárium");
   − v následujícím rozsahu (počet promítání): bez omezení;
   − nevýhradně, tj. společnost Krutart není omezena v možnosti sama filmy užívat nebo umožnit jejich užití jiným osobám za výše uvedených podmínek.

2. Za účelem řádného využití licence podle této smlouvy je společnost Krutart povinna poskytnout klientovi kopie filmů a doprovodných materiálů podle podmínek uvedených v příloze č. 1 a klient je oprávněn je používat v souvislosti s využíváním filmů za výše uvedených licenčních podmínek. V případě filmů nově vyrobených společností Krutart během dohodnuté licenční doby (viz článek II odst. 1 této smlouvy) dohodnou strany podmínky dodání kopií těchto filmů a doprovodných materiálů prostřednictvím e-mailu.`;
}

// ============================================================
// ONE+: Payment – Annual
// ============================================================
function onePlusPaymentAnnual(d: ContractFormData): string {
  return `IV.
Odměna

1. Klient je povinen zaplatit společnosti Krutart poplatek za poskytnutí licence podle této smlouvy v celkové výši ${or(d.feeAmount)} ${or(d.feeCurrency)} bez DPH za každých 12 měsíců dohodnuté doby trvání licence.

2. Celý roční licenční poplatek uvedený v předchozím odstavci bude uhrazen na bankovní účet společnosti Krutart uvedený v záhlaví této smlouvy na základě příslušného daňového dokladu – faktury společnosti Krutart vystavené během prvního měsíce příslušného 12měsíčního licenčního období. Tato faktura je splatná do 15 dnů od data vystavení.

3. Společnost Krutart je oprávněna kdykoli během sjednané doby platnosti licence písemně (alespoň e-mailem) oznámit klientovi zvýšení ročního licenčního poplatku pro následující 12měsíční licenční období. Pokud klient s takovým zvýšením nesouhlasí, je oprávněn tuto smlouvu písemně (alespoň e-mailem) vypovědět do 30 dnů od obdržení takového oznámení od společnosti Krutart, s účinností ke konci aktuálního licenčního období. Pokud klient nezašle společnosti Krutart písemnou výpověď v souladu s předchozí větou, má se za to, že klient s takovým zvýšením ročního licenčního poplatku souhlasí; v takovém případě se tento licenční poplatek automaticky zvýší pro příslušné následující 12měsíční období (a také pro všechna pozdější 12měsíční období, pokud bude licence prodloužena v souladu s touto smlouvou) a podmínky této smlouvy budou odpovídajícím způsobem změněny (bez nutnosti přijmout písemný dodatek); pokud tato smlouva stanoví rozdělení ročního licenčního poplatku na splátky, všechny tyto splátky se proporcionálně zvýší tak, aby v součtu odpovídaly nové výši ročního licenčního poplatku.`;
}

// ============================================================
// ONE+: Payment – Monthly Installments
// ============================================================
function onePlusPaymentMonthly(d: ContractFormData): string {
  return `IV.
Odměna

1. Klient je povinen zaplatit společnosti Krutart poplatek za poskytnutí licence podle této smlouvy v celkové výši ${or(d.feeAmount)} ${or(d.feeCurrency)} bez DPH za každých 12 měsíců dohodnuté doby trvání licence.

2. Roční licenční poplatek uvedený v předchozím odstavci bude uhrazen na bankovní účet společnosti Krutart uvedený v záhlaví této smlouvy ve 12 měsíčních splátkách, přičemž každá měsíční splátka bude činit ${or(d.monthlyAmount)} ${or(d.feeCurrency)} bez DPH, na základě příslušných daňových dokladů – faktur společnosti Krutart vystavených vždy v měsíci, ke kterému se příslušná splátka vztahuje. Každá taková faktura je splatná do 15 dnů od data vystavení.

3. Společnost Krutart je oprávněna kdykoli během sjednané doby platnosti licence písemně (alespoň e-mailem) oznámit klientovi zvýšení ročního licenčního poplatku pro následující 12měsíční licenční období. Pokud klient s takovým zvýšením nesouhlasí, je oprávněn tuto smlouvu písemně (alespoň e-mailem) vypovědět do 30 dnů od obdržení takového oznámení od společnosti Krutart, s účinností ke konci aktuálního licenčního období. Pokud klient nezašle společnosti Krutart písemnou výpověď v souladu s předchozí větou, má se za to, že klient s takovým zvýšením ročního licenčního poplatku souhlasí; v takovém případě se tento licenční poplatek automaticky zvýší pro příslušné následující 12měsíční období (a také pro všechna pozdější 12měsíční období, pokud bude licence prodloužena v souladu s touto smlouvou) a podmínky této smlouvy budou odpovídajícím způsobem změněny (bez nutnosti přijmout písemný dodatek); pokud tato smlouva stanoví rozdělení ročního licenčního poplatku na splátky, všechny tyto splátky se proporcionálně zvýší tak, aby v součtu odpovídaly nové výši ročního licenčního poplatku.`;
}

// ============================================================
// ONE+: Signatures + Annex 1 (Film catalogue) + Annex 2 (GTC)
// ============================================================
function onePlusClosing(d: ContractFormData): string {
  const filmCatalogue = d.films
    .map((f, i) => onePlusFilmCatalogueEntry(f, i, d.deliveryMethod))
    .join("\n\n");

  return `

Strany prohlašují, že porozuměly obsahu této smlouvy a souhlasí s ním, a to jak v celku, tak v jednotlivých ustanoveních, na důkaz čehož připojují své podpisy:

Přílohy:
− Příloha č. 1: Seznam filmů – Katalog filmů Krutart Fulldome
− Příloha č. 2: Všeobecné obchodní podmínky


V Praze dne ${formatDate(d.signingDatePrague)}

Krutart:

___________________________
Krutart s.r.o.
MgA. Martin Jůza, jednatel


V ${or(d.signingPlaceClient)} dne ${formatDate(d.signingDateClient)}

Klient:

___________________________
${or(d.clientName)}
${or(d.clientRepresentative)}


Příloha č. 1
k licenční smlouvě

Seznam filmů – Katalog filmů Krutart Fulldome

${filmCatalogue || "(Žádné filmy nebyly přidány)"}


${onePlusGTC()}`;
}

// ============================================================
// ONE+: General Terms and Conditions (Annex 2)
// ============================================================
function onePlusGTC(): string {
  return `Příloha č. 2
k licenční smlouvě

Všeobecné obchodní podmínky

a) Obecné licenční podmínky

1. Souhlas s použitím každého filmu poskytnutého na základě smlouvy zahrnuje následující typy souhlasů:
   a. souhlas s užitím zvukově obrazového záznamu filmu;
   b. souhlas s užitím filmu jako autorského díla jeho režiséra;
   c. souhlas s užitím autorských děl a uměleckých výkonů použitých ve filmu
   (všechny typy souhlasů podle tohoto ustanovení pro účely této smlouvy jsou dále společně označovány jako „licence").

2. Klient je oprávněn používat snímky obrazovky nebo výňatky z každého filmu (v celkové délce nejvýše 2 minuty) k výrobě propagačních materiálů určených k oznámení použití filmu za podmínek stanovených v této smlouvě a používat tyto materiály v obvyklém rozsahu. Klient však bere na vědomí, že ani takové použití částí filmu nesmí mít vliv na uměleckou hodnotu filmu.

3. Klient je povinen ve všech propagačních materiálech týkajících se konkrétního použití filmu podle smlouvy vhodným způsobem uvést, že Krutart je držitelem autorských práv k filmu, např. ve formě symbolu vyhrazených autorských práv nebo loga Krutart (například: © Krutart).

4. Klient není oprávněn provádět žádné změny, úpravy, doplňky, spojení nebo jiné zásahy do filmů, pokud k tomu společnost Krutart neudělí výslovný písemný souhlas.

5. Klient není oprávněn udělovat další sublicence ani jiným způsobem převádět práva z licence na třetí osoby.

6. Po uplynutí sjednané doby platnosti licence je klient povinen neprodleně smazat všechny soubory obsahující filmy a doprovodné materiály; na žádost společnosti Krutart je klient povinen písemně potvrdit, že tuto povinnost splnil. Po uplynutí sjednané doby platnosti licence klient rovněž přestane filmy jakýmkoli způsobem užívat a odstraní je ze svého programu; v případě porušení této povinnosti klientem je společnost Krutart oprávněna v každém případě požadovat od klienta smluvní pokutu ve výši 2 ročních licenčních poplatků uvedených v článku IV. odstavci 1 této smlouvy.

b) Překlad filmů

7. Klient je oprávněn vytvořit dabovanou verzi nebo titulky ke každému filmu při používání licence podle smlouvy.

8. Klient je povinen poskytnout každý takový překlad (tj. titulky a/nebo dabing) společnosti Krutart na vhodném médiu (potvrzeném společností Krutart) bez zbytečného odkladu po jeho vytvoření, nejpozději však do 1 měsíce od tohoto okamžiku.

9. Pokud jde o výrobu titulků: Klient tímto bezplatně uděluje společnosti Krutart oprávnění k použití každého takového titulku v souvislosti s konkrétním filmem bez (územního, časového nebo jiného) omezení, ale vždy mimo planetárium (práva k použití titulků v planetáriu náleží výlučně klientovi); společnost Krutart je oprávněna tato práva sublicencovat třetím stranám.

10. Pokud jde o výrobu dabingu: Klient je povinen dodržovat technické parametry týkající se dabingu a stanovené společností Krutart v protokolu, který bude klientovi za tímto účelem poskytnut společností Krutart. Klient je rovněž povinen poskytnout společnosti Krutart rozpočet na výrobu dabingu před zahájením výroby dabingu. Pokud po přijetí finálního dabingu od klienta (viz odstavec 8 výše) společnost Krutart potvrdí, že dabing splňuje stanovené technické parametry, je společnost Krutart oprávněna (nikoli však povinna) požádat klienta o udělení licence na tento dabing, která bude zahrnovat oprávnění k použití tohoto dabingu v souvislosti s konkrétním filmem bez (územních, časových nebo jiných) omezení, avšak vždy mimo planetárium (práva na použití dabingu v planetáriu zůstávají výlučně klientovi); společnost Krutart je oprávněna tato práva sublicencovat třetím stranám. Pokud je na žádost společnosti Krutart udělena licence na dabing v souladu s předchozí větou, zavazuje se společnost Krutart poskytnout klientovi slevu z licenčního poplatku uvedeného v článku IV smlouvy ve výši 1/2 dohodnutého rozpočtu na výrobu dabingu.

11. Klient je v každém případě povinen vypořádat práva třetích osob k jednotlivým překladům (včetně práv hlasových umělců v případě dabingu, pokud bude licence k dabingu udělena, viz odstavec 10 výše) svým jménem, na své náklady a v rozsahu, který mu umožňuje udělit příslušnou licenci společnosti Krutart v souladu s výše uvedenými podmínkami.

c) Sankce za opožděné platby

12. V případě, že se klient zpozdí s platbou odměny podle této smlouvy o více než 14 dní, zavazuje se zaplatit společnosti Krutart úrok z prodlení ve výši 0,05 % za každý celý den prodlení.

13. V případě, že se klient opozdí s platbou jakékoli části odměny o více než 30 dnů, je společnost Krutart oprávněna od smlouvy odstoupit s okamžitou účinností. V takovém případě zůstává společnosti Krutart zachováno právo na úroky z prodlení vzniklé do okamžiku odstoupení od této smlouvy. Pro vyloučení pochybností se sjednává, že odstoupení od smlouvy nebo zaplacení úroků z prodlení nemá vliv na právo společnosti Krutart na zaplacení původní dlužné částky.

d) Různé

14. Společnost Krutart poskytne přiměřenou technickou podporu pro přístup k filmům a jejich instalaci, nenese však žádnou odpovědnost za technická omezení na straně klienta (hardware, software, místní podmínky).

15. Smlouva se řídí právními předpisy České republiky. Veškeré spory budou řešeny soudem s věcnou příslušností v České republice; územní příslušnost soudu se určí podle sídla společnosti Krutart.

16. Obsah smlouvy je důvěrný, včetně všech finančních ujednání a dohodnutého rozsahu a podmínek licence.

17. Změny smlouvy musí být provedeny písemnou formou (což pro účely tohoto ustanovení nezahrnuje elektronickou komunikaci) a podpisy zástupců obou stran musí být na stejném dokumentu.

18. Odpověď strany podle § 1740 odst. 3 občanského zákoníku obsahující změnu nebo odchylku nepředstavuje přijetí nabídky k uzavření smlouvy, i když se podmínky nabídky podstatně nemění.`;
}

// ============================================================
// ONE+: Combined generators
// ============================================================
function onePlusAnnual(d: ContractFormData): string {
  return (
    onePlusBase(d) +
    "\n\n" +
    onePlusPaymentAnnual(d) +
    onePlusClosing(d)
  );
}

function onePlusMonthlyFn(d: ContractFormData): string {
  return (
    onePlusBase(d) +
    "\n\n" +
    onePlusPaymentMonthly(d) +
    onePlusClosing(d)
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
        return onePlusMonthlyFn(data);
      default:
        return onePlusAnnual(data);
    }
  }
}
