import {
  ContractFormData,
  ContractFilmData,
} from "@/lib/types";

function formatDate(dateStr: string): string {
  if (!dateStr) return "___________";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
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
Contracting Parties

Krutart s.r.o.
with its registered office at Karlovo náměstí 557/30, Nové Město, 120 00 Prague 2, Czech Republic
registered in the Commercial Register maintained by the Municipal Court in Prague, Section C, Entry 233141
Business ID: 035 33 450, Tax ID: CZ03533450
Account No.:
IBAN:
SWIFT: KOMBCZPPXXX
represented by MgA. Martin Jůza, Executive
(hereinafter "Krutart")

and

${or(d.clientName)}
with its registered office at: ${or(d.clientAddress)}
Business ID: ${or(d.clientBusinessId)}
Tax ID: ${or(d.clientTaxId)}
represented by ${or(d.clientRepresentative)}
(hereinafter the "client")

enter into this

licence agreement`;
}

// ============================================================
// SHARED: Film tech block for Single Licence (Article III §2)
// ============================================================
function singleFilmTechBlock(
  film: ContractFilmData,
  deliveryMethod: string
): string {
  return `a) Copy of the Film
   − Technical specifications of the copy:
      − resolution: ${or(film.resolution)}
      − domemaster format: ${or(film.domemasterFormat)}
      − soundmix: ${or(film.soundmix)}
      − M&E version of sound: ${film.meVersionOfSound ? "Yes" : "No"}
      − runtime: ${or(film.runtime)} min
      − language: ${or(film.language)}
   − Manner and date of making the copy available:
      − Krutart shall provide the copy of the Film to the client no later than 14 days from the date of signing this licence agreement.
      − ${deliveryMethod === "FTP" ? "Krutart shall provide the client with access to its FTP server so that the client can download the copy of the Film free of charge." : "Krutart shall deliver to the client a physical hard drive containing the copy of the Film for an additional handling fee of USD 300."}

b) Other materials
   − Specification of other materials:
      − trailer in flat and fulldome version
      − promotional materials (posters etc.)
   − Manner and date of providing the materials:
      − Krutart shall provide other materials to the client no later than 14 days from the date of signing this licence agreement.
      − Krutart shall deliver marketing materials to the client in the same manner as chosen for delivering the Film (either via FTP or on a physical hard drive).`;
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
              `   ${i + 1}. title: ${or(f.title)}, director(s): ${or(f.directors)}, year of production: ${or(f.yearOfProduction)}`
          )
          .join("\n")
      : `   title: ${or(film?.title)}, director(s): ${or(film?.directors)}, year of production: ${or(film?.yearOfProduction)}`;

  const filmLabel =
    d.films.length > 1 ? "audiovisual works" : "audiovisual work";
  const filmRef =
    d.films.length > 1
      ? '(hereinafter the "films")'
      : '(hereinafter the "film")';

  const filmTechBlocks = d.films
    .map((f, i) => {
      const prefix =
        d.films.length > 1 ? `Film ${i + 1}: "${or(f.title)}"\n` : "";
      return prefix + singleFilmTechBlock(f, d.deliveryMethod);
    })
    .join("\n\n");

  const licenseTimeFrame = d.licenseUnlimited
    ? "unlimited (i.e. for the entire duration of the rights to the film)"
    : `from ${formatDate(d.licenseFrom)} to ${formatDate(d.licenseTo)}`;

  return `LICENCE AGREEMENT

${partiesBlock(d)}

II.
Subject Matter

1. Krutart is a professional producer of films, series, and other audiovisual and multimedia content. Krutart has produced the following ${filmLabel}:
${filmInfo}
   ${filmRef}.
2. The client wishes to obtain Krutart's consent to use the film defined in this agreement under the conditions set out in this agreement.
3. In addition to the specific conditions set out in this agreement, the relationship between the parties is also governed by the general terms and conditions attached to this agreement as Annex No. 1.

III.
Licence

1. Krutart hereby grants the client the authorisation to use the film (licence) to the extent set out below:
   − for the following methods of use:
      − making the film available to the public in intangible form by means of performance from a recording (cinema screening rights),
      − making copies of the film for the above purpose;
   − within the following time frame: ${licenseTimeFrame}
   − in the following territory (country and/or specific planetarium): ${or(d.territory)} (hereinafter the "planetarium");
   − to the following extent (number of screenings): unlimited;
   − non-exclusively, i.e. Krutart is not restricted in its ability to use the film itself or to allow its use by other persons under the above conditions.

2. For the purpose of proper use of the licence under this agreement, Krutart shall provide the client with the following materials and the client is entitled to use them in connection with the use of the film under the above licence conditions:

${filmTechBlocks}`;
}

// ============================================================
// SINGLE LICENCE: Payment – Flat Fee
// ============================================================
function singlePaymentFlatFee(d: ContractFormData): string {
  return `IV.
Remuneration

1. The client shall pay Krutart a fee for granting the licence under this agreement in the total amount of ${or(d.feeAmount)} ${or(d.feeCurrency)} excluding VAT.

2. The licence fee referred to in the preceding paragraph shall be paid to Krutart's bank account specified in the heading of this agreement no later than 14 days from the date of signing this agreement on the basis of the relevant tax document – Krutart's invoice.`;
}

// ============================================================
// SINGLE LICENCE: Payment – Installments
// ============================================================
function singlePaymentInstallments(d: ContractFormData): string {
  const installmentLines = d.installments
    .map(
      (inst, i) =>
        `   − installment ${i + 1} in the amount of ${or(inst.amount)} ${or(inst.currency)} excluding VAT shall be paid to Krutart no later than ${formatDate(inst.dueDate)};`
    )
    .join("\n");

  return `IV.
Remuneration

1. The client shall pay Krutart a fee for granting the licence under this agreement in the total amount of ${or(d.feeAmount)} ${or(d.feeCurrency)} excluding VAT.

2. The licence fee referred to in the preceding paragraph shall be paid to Krutart's bank account specified in the heading of this agreement on the basis of the relevant tax documents – Krutart's invoices, in the following installments:

${installmentLines || "   (No installments defined)"}`;
}

// ============================================================
// SINGLE LICENCE: Payment – Revenue Share
// ============================================================
function singlePaymentRevenueShare(d: ContractFormData): string {
  let minGuaranteeClause = "";

  if (d.hasMinGuarantee && !d.hasRevenueCap) {
    minGuaranteeClause = `

3. The parties have agreed that during the entire licence period the client shall provide Krutart with a revenue share remuneration in a total amount of at least ${or(d.minGuaranteeAmount)} ${or(d.minGuaranteeCurrency)} (minimum guarantee). If the resulting sum of the revenue share remunerations does not reach the amount of the minimum guarantee referred to in the preceding sentence, Krutart shall be entitled to charge the client in the last invoice sent to the client after the end of the licence period a surcharge in the amount corresponding to the difference between the agreed minimum guarantee and the total revenue share remuneration paid to date.`;
  } else if (d.hasMinGuarantee && d.hasRevenueCap) {
    minGuaranteeClause = `

3. The parties have agreed that during the entire licence period the client shall provide Krutart with a revenue share remuneration in a total amount of at least ${or(d.minGuaranteeAmount)} ${or(d.minGuaranteeCurrency)} (minimum guarantee). If the resulting sum of the revenue share remunerations does not reach the amount of the minimum guarantee referred to in the preceding sentence, Krutart shall be entitled to charge the client in the last invoice sent to the client after the end of the licence period a surcharge in the amount corresponding to the difference between the agreed minimum guarantee and the total revenue share remuneration paid to date. The parties have also agreed that the client shall not pay Krutart in aggregate more than ${or(d.revenueCapAmount)} ${or(d.feeCurrency)} as revenue share. Therefore, if the amount of the revenue share at any time during the licence period reaches the said amount and this amount has been duly paid to Krutart, Krutart shall not be entitled to claim from the client any further revenue share or flat fee for granting the licence under this agreement.`;
  }

  return `IV.
Remuneration

1. The client shall pay Krutart a share for granting the licence under this agreement in the amount of:
   − ${or(d.revenueShareSchool)}% of the price of each ticket sold in the case of special screenings of the film for schools;
   − ${or(d.revenueSharePublic)}% of the price of each ticket sold in the case of screenings of the film for the general public.

   The client shall deduct VAT (if applicable) from the price of each ticket before calculating Krutart's share.

   At the same time, the parties have agreed that Krutart shall be entitled to the share only from the moment when its total amount exceeds the client's promotion and distribution costs agreed at a fixed lump sum of ${or(d.promotionalCosts)} ${or(d.feeCurrency)}.

2. The client shall send to Krutart's e-mail address krutart@krutart.cz a written detailed statement of the share fee for the past calendar quarter; this statement must always be sent during the first 15 days of the following calendar quarter. On the basis of this statement, Krutart shall issue an invoice to the client for the share for the previous quarter. The corresponding VAT shall be added to this remuneration. The share fee shall be paid by the client to Krutart on the basis of the issued invoice, no later than 15 days from the date of its issuance. If the client is more than 30 days late in sending the proper detailed written statement of the share fee, Krutart shall be entitled in each such case to charge the client a contractual penalty of 100 EUR per day of delay and at the same time Krutart shall be entitled to unilaterally terminate this agreement by withdrawal; such withdrawal from the agreement shall not affect Krutart's right to the said contractual penalty.${minGuaranteeClause}`;
}

// ============================================================
// SINGLE LICENCE: Signatures + Annex (GTC)
// ============================================================
function singleLicenceClosing(d: ContractFormData): string {
  return `

The parties declare that they have understood and agree with the content of this agreement, both as a whole and in its individual provisions, in witness whereof they affix their signatures:

Annexes: Annex No. 1: General Terms and Conditions


In Prague, on ${formatDate(d.signingDatePrague)}

Krutart:

___________________________
Krutart s.r.o.
MgA. Martin Jůza, Executive


In ${or(d.signingPlaceClient)}, on ${formatDate(d.signingDateClient)}

Client:

___________________________
${or(d.clientName)}
${or(d.clientRepresentative)}


${singleGTC()}`;
}

// ============================================================
// SINGLE LICENCE: General Terms and Conditions (Annex 1)
// ============================================================
function singleGTC(): string {
  return `Annex No. 1
to the licence agreement

General Terms and Conditions

a) General licence terms

1. The consent to use the film granted under this agreement includes the following types of consents:
   a. consent to use the audio-visual recording of the film;
   b. consent to use the film as a copyrighted work of its director;
   c. consent to use copyrighted works and artistic performances used in the film
   (all types of consents under this provision are for the purposes of this agreement hereinafter collectively referred to as the "licence").

2. The client is entitled to use screenshots or excerpts from the film (with a total length of no more than 2 minutes) to produce promotional materials intended to announce the use of the film under the conditions set out in this agreement and to use these materials to the usual extent. However, the client acknowledges that even such use of parts of the film must not affect the artistic value of the film.

3. The client shall, in all promotional materials relating to the use of the film under the agreement, appropriately indicate that Krutart is the holder of copyright to the film, e.g. in the form of a reserved copyright symbol or Krutart's logo (for example: © Krutart).

4. The client is not entitled to make any changes, modifications, additions, combinations, or other interventions to the film unless Krutart grants express written consent thereto.

5. The client is not entitled to grant further sublicences or otherwise transfer the rights from the licence to third parties.

6. Upon expiry of the agreed licence period, the client shall immediately delete all files containing the film and accompanying materials, cease all use of the film and remove it from its programme. At Krutart's request, the client shall confirm in writing that these obligations have been fulfilled. In the event of a breach of these obligations by the client, Krutart shall in each case be entitled to demand from the client a contractual penalty in the amount equal to the total licence fee paid by the client to Krutart under Article IV of this agreement.

b) Translation of the Film

7. The client is entitled to create a dubbed version or subtitles for the film when using the licence under the agreement.

8. The client shall provide each such translation (i.e. subtitles and/or dubbing) to Krutart on a suitable medium (confirmed by Krutart) without undue delay after its creation, but no later than 1 month from that moment.

9. Regarding the production of subtitles: The client hereby grants Krutart free of charge the authorisation to use each such subtitle in connection with the film without (territorial, temporal, or other) limitation, but always outside the planetarium (the rights to use the subtitles in the planetarium belong exclusively to the client); Krutart is entitled to sublicence these rights to third parties.

10. Regarding the production of dubbing: The client shall comply with the technical parameters relating to dubbing as set by Krutart in a protocol to be provided to the client for this purpose by Krutart. The client shall also provide Krutart with a budget for the production of the dubbing before the commencement of dubbing production. If, upon receipt of the final dubbing from the client (see paragraph 8 above), Krutart confirms that the dubbing meets the set technical parameters, Krutart shall be entitled (but not obliged) to request the client to grant a licence to the dubbing, which shall include authorisation to use the dubbing in connection with the film without (territorial, temporal, or other) limitations, but always outside the planetarium (the rights to use the dubbing in the planetarium remain exclusively with the client); Krutart is entitled to sublicence these rights to third parties. If, at Krutart's request, a licence to the dubbing is granted in accordance with the preceding sentence, Krutart undertakes to provide the client with a discount on the film licence fee specified in Article IV of the agreement in the amount of 1/2 of the agreed dubbing production budget.

11. The client shall in each case settle the rights of third parties to individual translations (including the rights of voice artists in the case of dubbing, if the dubbing licence is granted, see paragraph 10 above) in its own name, at its own expense, and to the extent that allows it to grant the relevant licence to Krutart in accordance with the above conditions.

c) Penalties for Late Payments

12. In the event that the client is late with payment of remuneration under this agreement, the client undertakes to pay Krutart a late payment interest of 0.05% for each full day of delay.

13. In the event that the client is more than 30 days late with payment of any part of the remuneration, Krutart shall be entitled to withdraw from the agreement with immediate effect. In such a case, Krutart's right to the late payment interest accrued until the moment of withdrawal from this agreement shall be preserved. For the avoidance of doubt, it is agreed that the withdrawal from the agreement or payment of late payment interest shall not affect Krutart's right to payment of the original amount due.

d) Miscellaneous

14. The agreement shall be governed by the laws of the Czech Republic. All disputes shall be resolved by a court with subject-matter jurisdiction in the Czech Republic; the territorial jurisdiction of the court shall be determined according to the registered office of Krutart.

15. The content of the agreement is confidential, including all financial arrangements and the agreed scope and conditions of the licence.

16. Amendments to the agreement must be made in written form (which for the purposes of this provision does not include electronic communication) and the signatures of the representatives of both parties must be on the same document.

17. A party's response pursuant to Section 1740(3) of the Civil Code containing a change or deviation shall not constitute acceptance of an offer to conclude an agreement, even if the terms of the offer are not substantially altered.`;
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
  return `${index + 1}. title: ${or(film.title)}, director(s): ${or(film.directors)}, year of production: ${or(film.yearOfProduction)}

   a) Copy of the Film
      − Technical specifications of the copy:
         − resolution: ${or(film.resolution)}
         − domemaster format: ${or(film.domemasterFormat)}
         − soundmix: ${or(film.soundmix)}
         − M&E version of sound: ${film.meVersionOfSound ? "Yes" : "No"}
         − runtime: ${or(film.runtime)} min
         − language: ${or(film.language)}
      − Manner and date of making the copy available:
         − Krutart shall provide the copy of the film to the client no later than 14 days from the date of signing the licence agreement.
         − ${deliveryMethod === "FTP" ? "Krutart shall provide the client with access to its FTP server so that the client can download the copy of the film free of charge." : "Krutart shall deliver to the client a physical hard drive containing the copy of the film for an additional handling fee of USD 300."}

   b) Other materials
      − Specification of other materials:
         − trailer in flat and fulldome version
         − promotional materials (poster etc.)
      − Manner and date of making the materials available:
         − Krutart shall provide other materials to the client no later than 14 days from the date of signing the licence agreement.
         − Krutart shall deliver marketing materials to the client in the same manner as chosen for delivering the film (either via FTP or on a physical hard drive).`;
}

// ============================================================
// ONE+: Base (Articles I–III)
// ============================================================
function onePlusBase(d: ContractFormData): string {
  const licenseFrom = formatDate(d.licenseFrom);
  const licenseTo = formatDate(d.licenseTo);

  return `LICENCE AGREEMENT

${partiesBlock(d)}

II.
Subject Matter

1. Krutart is a professional producer of films, series, and other audiovisual and multimedia content. Krutart has produced the audiovisual works listed in Annex No. 1 of this agreement (hereinafter the "films"). For the purposes of this agreement, the term "films" includes, in addition to the films listed in Annex No. 1, all other fulldome films whose production Krutart completes during the agreed licence period (for which the client has paid the subscription under Article IV), as stated in Article III, paragraph 1. Krutart undertakes to inform the client by e-mail at ${or(d.clientEmail)} about all films newly produced by Krutart during the agreed licence period, whereby Krutart shall provide the client with detailed information about each such new film, including the specifications of its copy and the specifications of other related materials (analogously to how these specifications are stated for existing films in Annex No. 1 of this agreement). The client acknowledges that Krutart does not guarantee a specific or minimum number of newly produced films during the licence period.

2. The client wishes to obtain Krutart's consent to use the films defined in this agreement under the conditions set out in this agreement. The licence granted under this agreement relates to Krutart's subscription service called Krutart One+.

3. In addition to the specific conditions set out in this agreement, the relationship between the parties is also governed by the general terms and conditions attached to this agreement as Annex No. 2.

III.
Licence

1. Krutart hereby grants the client the authorisation to use the films (licence) to the extent set out below:
   − for the following methods of use:
      − making the films available to the public in intangible form by means of performance from a recording (cinema screening rights),
      − making copies of the films for the above purpose;
   − within the following time frame: 24 months, specifically from ${licenseFrom} to ${licenseTo}; if no later than 30 days before the end of the agreed licence period neither party to this agreement notifies the other party in writing (at least by e-mail) of its intention to terminate this agreement, the licence period shall be automatically extended by a further 12 months, and repeatedly, i.e. this automatic extension shall continue until one of the parties notifies the other party in the agreed manner of its intention to terminate the agreement at the end of the current licence period; Krutart undertakes to always inform the client in writing (by e-mail) at least 45 days before the end of the current licence period about the approaching end of this licence period;
   − in the following territory – dome/planetarium/mobile projection unit: ${or(d.territory)} (hereinafter the "planetarium");
   − to the following extent (number of screenings): unlimited;
   − non-exclusively, i.e. Krutart is not restricted in its ability to use the films itself or to allow their use by other persons under the above conditions.

2. For the purpose of proper use of the licence under this agreement, Krutart shall provide the client with copies of the films and accompanying materials according to the conditions set out in Annex No. 1 and the client is entitled to use them in connection with the use of the films under the above licence conditions. In the case of films newly produced by Krutart during the agreed licence period (see Article II paragraph 1 of this agreement), the parties shall agree on the terms of delivery of copies of these films and accompanying materials via e-mail.`;
}

// ============================================================
// ONE+: Payment – Annual
// ============================================================
function onePlusPaymentAnnual(d: ContractFormData): string {
  return `IV.
Remuneration

1. The client shall pay Krutart a fee for granting the licence under this agreement in the total amount of ${or(d.feeAmount)} ${or(d.feeCurrency)} excluding VAT for each 12 months of the agreed licence period.

2. The entire annual licence fee referred to in the preceding paragraph shall be paid to Krutart's bank account specified in the heading of this agreement on the basis of the relevant tax document – Krutart's invoice issued during the first month of the respective 12-month licence period. This invoice is due within 15 days of the date of issue.

3. Krutart shall be entitled at any time during the agreed licence period to notify the client in writing (at least by e-mail) of an increase in the annual licence fee for the following 12-month licence period. If the client does not agree with such increase, the client shall be entitled to terminate this agreement in writing (at least by e-mail) within 30 days of receiving such notification from Krutart, with effect as of the end of the current licence period. If the client does not send Krutart a written notice of termination in accordance with the preceding sentence, the client shall be deemed to have agreed to such increase of the annual licence fee; in such case, this licence fee shall automatically increase for the respective following 12-month period (and also for all subsequent 12-month periods if the licence is extended in accordance with this agreement) and the terms of this agreement shall be amended accordingly (without the need to adopt a written amendment); if this agreement provides for the division of the annual licence fee into installments, all such installments shall proportionally increase so that they correspond in total to the new annual licence fee.`;
}

// ============================================================
// ONE+: Payment – Monthly Installments
// ============================================================
function onePlusPaymentMonthly(d: ContractFormData): string {
  return `IV.
Remuneration

1. The client shall pay Krutart a fee for granting the licence under this agreement in the total amount of ${or(d.feeAmount)} ${or(d.feeCurrency)} excluding VAT for each 12 months of the agreed licence period.

2. The annual licence fee referred to in the preceding paragraph shall be paid to Krutart's bank account specified in the heading of this agreement in 12 monthly installments, with each monthly installment being ${or(d.monthlyAmount)} ${or(d.feeCurrency)} excluding VAT, on the basis of the relevant tax documents – Krutart's invoices issued in the month to which the respective installment relates. Each such invoice is due within 15 days of the date of issue.

3. Krutart shall be entitled at any time during the agreed licence period to notify the client in writing (at least by e-mail) of an increase in the annual licence fee for the following 12-month licence period. If the client does not agree with such increase, the client shall be entitled to terminate this agreement in writing (at least by e-mail) within 30 days of receiving such notification from Krutart, with effect as of the end of the current licence period. If the client does not send Krutart a written notice of termination in accordance with the preceding sentence, the client shall be deemed to have agreed to such increase of the annual licence fee; in such case, this licence fee shall automatically increase for the respective following 12-month period (and also for all subsequent 12-month periods if the licence is extended in accordance with this agreement) and the terms of this agreement shall be amended accordingly (without the need to adopt a written amendment); if this agreement provides for the division of the annual licence fee into installments, all such installments shall proportionally increase so that they correspond in total to the new annual licence fee.`;
}

// ============================================================
// ONE+: Signatures + Annex 1 (Film catalogue) + Annex 2 (GTC)
// ============================================================
function onePlusClosing(d: ContractFormData): string {
  const filmCatalogue = d.films
    .map((f, i) => onePlusFilmCatalogueEntry(f, i, d.deliveryMethod))
    .join("\n\n");

  return `

The parties declare that they have understood and agree with the content of this agreement, both as a whole and in its individual provisions, in witness whereof they affix their signatures:

Annexes:
− Annex No. 1: List of Films – Krutart Fulldome Film Catalogue
− Annex No. 2: General Terms and Conditions


In Prague, on ${formatDate(d.signingDatePrague)}

Krutart:

___________________________
Krutart s.r.o.
MgA. Martin Jůza, Executive


In ${or(d.signingPlaceClient)}, on ${formatDate(d.signingDateClient)}

Client:

___________________________
${or(d.clientName)}
${or(d.clientRepresentative)}


Annex No. 1
to the licence agreement

List of Films – Krutart Fulldome Film Catalogue

${filmCatalogue || "(No films have been added)"}


${onePlusGTC()}`;
}

// ============================================================
// ONE+: General Terms and Conditions (Annex 2)
// ============================================================
function onePlusGTC(): string {
  return `Annex No. 2
to the licence agreement

General Terms and Conditions

a) General licence terms

1. The consent to use each film provided under the agreement includes the following types of consents:
   a. consent to use the audio-visual recording of the film;
   b. consent to use the film as a copyrighted work of its director;
   c. consent to use copyrighted works and artistic performances used in the film
   (all types of consents under this provision are for the purposes of this agreement hereinafter collectively referred to as the "licence").

2. The client is entitled to use screenshots or excerpts from each film (with a total length of no more than 2 minutes) to produce promotional materials intended to announce the use of the film under the conditions set out in this agreement and to use these materials to the usual extent. However, the client acknowledges that even such use of parts of the film must not affect the artistic value of the film.

3. The client shall, in all promotional materials relating to a specific use of the film under the agreement, appropriately indicate that Krutart is the holder of copyright to the film, e.g. in the form of a reserved copyright symbol or Krutart's logo (for example: © Krutart).

4. The client is not entitled to make any changes, modifications, additions, combinations, or other interventions to the films unless Krutart grants express written consent thereto.

5. The client is not entitled to grant further sublicences or otherwise transfer the rights from the licence to third parties.

6. Upon expiry of the agreed licence period, the client shall immediately delete all files containing the films and accompanying materials; at Krutart's request, the client shall confirm in writing that this obligation has been fulfilled. Upon expiry of the agreed licence period, the client shall also cease to use the films in any way and remove them from its programme; in the event of a breach of this obligation by the client, Krutart shall in each case be entitled to demand from the client a contractual penalty in the amount of 2 annual licence fees as referred to in Article IV paragraph 1 of this agreement.

b) Translation of the Films

7. The client is entitled to create a dubbed version or subtitles for each film when using the licence under the agreement.

8. The client shall provide each such translation (i.e. subtitles and/or dubbing) to Krutart on a suitable medium (confirmed by Krutart) without undue delay after its creation, but no later than 1 month from that moment.

9. Regarding the production of subtitles: The client hereby grants Krutart free of charge the authorisation to use each such subtitle in connection with the specific film without (territorial, temporal, or other) limitation, but always outside the planetarium (the rights to use the subtitles in the planetarium belong exclusively to the client); Krutart is entitled to sublicence these rights to third parties.

10. Regarding the production of dubbing: The client shall comply with the technical parameters relating to dubbing as set by Krutart in a protocol to be provided to the client for this purpose by Krutart. The client shall also provide Krutart with a budget for the production of the dubbing before the commencement of dubbing production. If, upon receipt of the final dubbing from the client (see paragraph 8 above), Krutart confirms that the dubbing meets the set technical parameters, Krutart shall be entitled (but not obliged) to request the client to grant a licence to the dubbing, which shall include authorisation to use the dubbing in connection with the specific film without (territorial, temporal, or other) limitations, but always outside the planetarium (the rights to use the dubbing in the planetarium remain exclusively with the client); Krutart is entitled to sublicence these rights to third parties. If, at Krutart's request, a licence to the dubbing is granted in accordance with the preceding sentence, Krutart undertakes to provide the client with a discount on the licence fee specified in Article IV of the agreement in the amount of 1/2 of the agreed dubbing production budget.

11. The client shall in each case settle the rights of third parties to individual translations (including the rights of voice artists in the case of dubbing, if the dubbing licence is granted, see paragraph 10 above) in its own name, at its own expense, and to the extent that allows it to grant the relevant licence to Krutart in accordance with the above conditions.

c) Penalties for Late Payments

12. In the event that the client is more than 14 days late with payment of remuneration under this agreement, the client undertakes to pay Krutart a late payment interest of 0.05% for each full day of delay.

13. In the event that the client is more than 30 days late with payment of any part of the remuneration, Krutart shall be entitled to withdraw from the agreement with immediate effect. In such a case, Krutart's right to the late payment interest accrued until the moment of withdrawal from this agreement shall be preserved. For the avoidance of doubt, it is agreed that the withdrawal from the agreement or payment of late payment interest shall not affect Krutart's right to payment of the original amount due.

d) Miscellaneous

14. Krutart shall provide reasonable technical support for access to and installation of the films, but shall bear no responsibility for technical limitations on the client's side (hardware, software, local conditions).

15. The agreement shall be governed by the laws of the Czech Republic. All disputes shall be resolved by a court with subject-matter jurisdiction in the Czech Republic; the territorial jurisdiction of the court shall be determined according to the registered office of Krutart.

16. The content of the agreement is confidential, including all financial arrangements and the agreed scope and conditions of the licence.

17. Amendments to the agreement must be made in written form (which for the purposes of this provision does not include electronic communication) and the signatures of the representatives of both parties must be on the same document.

18. A party's response pursuant to Section 1740(3) of the Civil Code containing a change or deviation shall not constitute acceptance of an offer to conclude an agreement, even if the terms of the offer are not substantially altered.`;
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
