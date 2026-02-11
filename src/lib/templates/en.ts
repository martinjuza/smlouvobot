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

function or(val: string | undefined | null, placeholder = "___________"): string {
  return val && val.trim() ? val : placeholder;
}

function filmTechBlock(film: ContractFilmData, index: number): string {
  return `${index + 1}. "${or(film.title)}"
   Resolution: ${or(film.resolution)}
   Format: ${or(film.domemasterFormat)}
   Soundmix: ${or(film.soundmix)}
   M&E version of Sound: ${film.meVersionOfSound ? "Yes" : "No"}
   Runtime: ${or(film.runtime)} min
   Language: ${or(film.language)}`;
}

function filmListInline(films: ContractFilmData[]): string {
  return films.map((f) => `"${f.title}"`).join(", ");
}

// ============================================================
// SINGLE LICENCE – FLAT FEE (EN)
// ============================================================
function singleLicenceFlatFee(d: ContractFormData): string {
  const filmsList = d.films.map((f, i) => filmTechBlock(f, i)).join("\n\n");
  const filmNames = filmListInline(d.films);

  return `LICENCE AGREEMENT

entered into between:

Fulldome Film Society z.s. (hereinafter referred to as the "Licensor")
Registered Office: Vyšehradská 320/49, Nusle, 128 00 Prague 2, Czech Republic
Business Registration Number: 06476317
Represented by: Martin Juza, Director

and

${or(d.clientName)} (hereinafter referred to as the "Licensee")
Registered Office: ${or(d.clientAddress)}
Business Registration Number: ${or(d.clientBusinessId)}
Tax ID: ${or(d.clientTaxId)}
Registered at: ${or(d.clientRegisterCourt)}, Section ${or(d.clientRegisterSection)}, Entry ${or(d.clientRegisterEntry)}
Represented by: ${or(d.clientRepresentative)}

(each individually as the "Party" or collectively as the "Parties")

WHEREAS:

The Licensor is an association whose mission is to promote and distribute fulldome content globally. The Licensor holds the necessary rights and authority to licence the Film(s) listed below for fulldome exhibitions.

The Licensee operates a fulldome theater/planetarium and wishes to obtain the right to publicly screen the Film(s) in their venue.

The Parties have agreed on the following terms:

ARTICLE I – DEFINITIONS

1.1. "Film(s)" means the following fulldome production(s):
${filmsList}

1.2. "Territory" means: ${or(d.territory)}

1.3. "Licence Period" means: ${d.licenseUnlimited ? "Unlimited (perpetual licence)" : `from ${formatDate(d.licenseFrom)} to ${formatDate(d.licenseTo)}`}

ARTICLE II – GRANT OF LICENCE

2.1. The Licensor hereby grants the Licensee a non-exclusive licence to publicly screen the Film(s) in the Territory during the Licence Period.

2.2. The Licensee may screen the Film(s) to both public and school/educational audiences within the Territory.

2.3. The Licensee shall not sublicence, distribute, copy, or make the Film(s) available to any third party without prior written consent of the Licensor.

2.4. The Licensee shall use the Film(s) solely for fulldome projection and shall not convert, edit, or modify the Film(s) in any way without the prior written consent of the Licensor.

ARTICLE III – LICENCE FEE AND PAYMENT

3.1. The Licence Fee for the Film(s) is: ${or(d.feeAmount)} ${or(d.feeCurrency)} (flat fee).

3.2. The Licence Fee shall be paid by the Licensee to the Licensor's bank account within 30 days from the date of signing this Agreement.

3.3. Bank details:
   Account holder: Fulldome Film Society z.s.
   Bank: Fio banka, a.s.
   IBAN: CZ2120100000002902248837
   SWIFT/BIC: FIOBCZPPXXX

3.4. All payments shall be made free of any bank charges to the Licensor. Any bank fees shall be borne by the Licensee.

ARTICLE IV – DELIVERY

4.1. The Licensor shall deliver the Film(s) to the Licensee via ${d.deliveryMethod === "FTP" ? "FTP download link" : "external HDD (shipped at Licensee's cost)"} within 14 days of receiving the signed Agreement and confirmation of payment.

4.2. Upon delivery, the Licensee shall confirm receipt of the Film(s) and verify their technical quality within 7 days. If the Licensee fails to notify the Licensor of any issues within this period, the Film(s) shall be deemed accepted.

ARTICLE V – PROMOTIONAL MATERIALS

5.1. The Licensor shall provide the Licensee with available promotional materials (trailers, posters, stills) for the purpose of promoting screenings of the Film(s) in the Territory.

5.2. The Licensee agrees to credit the Licensor and the original producers in all promotional materials related to the Film(s).

ARTICLE VI – REPORTING

6.1. The Licensee shall provide the Licensor with annual screening reports including the number of screenings and attendance figures, no later than January 31st of each calendar year for the preceding year.

ARTICLE VII – TERMINATION

7.1. Either Party may terminate this Agreement with 90 days written notice to the other Party.

7.2. The Licensor may terminate this Agreement immediately if the Licensee materially breaches any term of this Agreement and fails to remedy such breach within 30 days of written notice.

7.3. Upon termination, the Licensee shall cease all screenings of the Film(s) and delete/destroy all copies of the Film(s) in their possession within 30 days, confirming such deletion in writing to the Licensor.

ARTICLE VIII – LIABILITY AND WARRANTIES

8.1. The Licensor warrants that it has the right and authority to grant the licence described in this Agreement.

8.2. The Licensor shall not be liable for any indirect, consequential, or incidental damages arising from the use of the Film(s).

8.3. The Licensee shall be solely responsible for obtaining any local permits or approvals required for public screenings.

ARTICLE IX – CONFIDENTIALITY

9.1. Both Parties agree to keep confidential the financial terms of this Agreement and any proprietary information exchanged during the course of this relationship.

ARTICLE X – GOVERNING LAW AND DISPUTE RESOLUTION

10.1. This Agreement shall be governed by and construed in accordance with the laws of the Czech Republic.

10.2. Any disputes arising from this Agreement shall be resolved first through good faith negotiations. If unresolved within 30 days, disputes shall be submitted to the competent courts of the Czech Republic.

ARTICLE XI – FINAL PROVISIONS

11.1. This Agreement constitutes the entire agreement between the Parties and supersedes all prior negotiations, representations, or agreements relating to this subject matter.

11.2. Any amendments to this Agreement must be made in writing and signed by both Parties.

11.3. This Agreement is executed in two counterparts, each Party receiving one.

11.4. This Agreement becomes effective upon signing by both Parties.


In Prague, on ${formatDate(d.signingDatePrague)}

_______________________________
Fulldome Film Society z.s.
Martin Juza, Director


In ${or(d.signingPlaceClient)}, on ${formatDate(d.signingDateClient)}

_______________________________
${or(d.clientName)}
${or(d.clientRepresentative)}`;
}

// ============================================================
// SINGLE LICENCE – INSTALLMENTS (EN)
// ============================================================
function singleLicenceInstallments(d: ContractFormData): string {
  const base = singleLicenceFlatFee(d);

  const installmentLines = d.installments
    .map(
      (inst, i) =>
        `   ${i + 1}. ${or(inst.amount)} ${or(inst.currency)} – due by ${formatDate(inst.dueDate)}`
    )
    .join("\n");

  const paymentSection = `3.1. The total Licence Fee for the Film(s) is: ${or(d.feeAmount)} ${or(d.feeCurrency)}, payable in the following installments:

${installmentLines || "   (No installments defined)"}

3.2. Each installment shall be paid by the Licensee to the Licensor's bank account by the respective due date.`;

  return base.replace(
    /3\.1\. The Licence Fee for the Film\(s\) is:.*?\n\n3\.2\. The Licence Fee shall be paid.*?signing this Agreement\./s,
    paymentSection
  );
}

// ============================================================
// SINGLE LICENCE – REVENUE SHARE (EN)
// ============================================================
function singleLicenceRevenueShare(d: ContractFormData): string {
  const filmsList = d.films.map((f, i) => filmTechBlock(f, i)).join("\n\n");
  const filmNames = filmListInline(d.films);

  const minGuaranteeClause = d.hasMinGuarantee
    ? `3.3. Minimum Guarantee: The Licensee guarantees a minimum annual payment of ${or(d.minGuaranteeAmount)} ${or(d.minGuaranteeCurrency)} regardless of the actual revenue generated. This amount shall be paid by the end of each licence year.`
    : "";

  const revenueCapClause = d.hasRevenueCap
    ? `3.4. Revenue Cap: The total revenue share payments shall not exceed ${or(d.revenueCapAmount)} ${or(d.feeCurrency)} over the entire Licence Period.`
    : "";

  return `LICENCE AGREEMENT (REVENUE SHARE)

entered into between:

Fulldome Film Society z.s. (hereinafter referred to as the "Licensor")
Registered Office: Vyšehradská 320/49, Nusle, 128 00 Prague 2, Czech Republic
Business Registration Number: 06476317
Represented by: Martin Juza, Director

and

${or(d.clientName)} (hereinafter referred to as the "Licensee")
Registered Office: ${or(d.clientAddress)}
Business Registration Number: ${or(d.clientBusinessId)}
Tax ID: ${or(d.clientTaxId)}
Registered at: ${or(d.clientRegisterCourt)}, Section ${or(d.clientRegisterSection)}, Entry ${or(d.clientRegisterEntry)}
Represented by: ${or(d.clientRepresentative)}

(each individually as the "Party" or collectively as the "Parties")

WHEREAS:

The Licensor is an association whose mission is to promote and distribute fulldome content globally. The Licensor holds the necessary rights and authority to licence the Film(s) listed below for fulldome exhibitions.

The Licensee operates a fulldome theater/planetarium and wishes to obtain the right to publicly screen the Film(s) in their venue under a revenue sharing arrangement.

The Parties have agreed on the following terms:

ARTICLE I – DEFINITIONS

1.1. "Film(s)" means the following fulldome production(s):
${filmsList}

1.2. "Territory" means: ${or(d.territory)}

1.3. "Licence Period" means: ${d.licenseUnlimited ? "Unlimited (perpetual licence)" : `from ${formatDate(d.licenseFrom)} to ${formatDate(d.licenseTo)}`}

1.4. "Net Revenue" means the gross ticket revenue from screenings of the Film(s), less applicable taxes and any agreed promotional costs.

ARTICLE II – GRANT OF LICENCE

2.1. The Licensor hereby grants the Licensee a non-exclusive licence to publicly screen the Film(s) in the Territory during the Licence Period.

2.2. The Licensee may screen the Film(s) to both public and school/educational audiences within the Territory.

2.3. The Licensee shall not sublicence, distribute, copy, or make the Film(s) available to any third party without prior written consent of the Licensor.

2.4. The Licensee shall use the Film(s) solely for fulldome projection and shall not convert, edit, or modify the Film(s) in any way without the prior written consent of the Licensor.

ARTICLE III – REVENUE SHARE AND PAYMENT

3.1. The Licensee shall pay the Licensor the following share of Net Revenue:
   - School/educational screenings: ${or(d.revenueShareSchool)}% of Net Revenue
   - Public screenings: ${or(d.revenueSharePublic)}% of Net Revenue

3.2. Promotional costs deductible from gross revenue: ${or(d.promotionalCosts)} ${or(d.feeCurrency)}

${minGuaranteeClause}

${revenueCapClause}

3.5. Revenue share payments shall be made quarterly, within 30 days after the end of each calendar quarter, accompanied by a detailed report of all screenings, attendance, and revenue.

3.6. Bank details:
   Account holder: Fulldome Film Society z.s.
   Bank: Fio banka, a.s.
   IBAN: CZ2120100000002902248837
   SWIFT/BIC: FIOBCZPPXXX

3.7. All payments shall be made free of any bank charges to the Licensor. Any bank fees shall be borne by the Licensee.

ARTICLE IV – DELIVERY

4.1. The Licensor shall deliver the Film(s) to the Licensee via ${d.deliveryMethod === "FTP" ? "FTP download link" : "external HDD (shipped at Licensee's cost)"} within 14 days of receiving the signed Agreement.

4.2. Upon delivery, the Licensee shall confirm receipt of the Film(s) and verify their technical quality within 7 days.

ARTICLE V – PROMOTIONAL MATERIALS

5.1. The Licensor shall provide the Licensee with available promotional materials (trailers, posters, stills) for the purpose of promoting screenings of the Film(s) in the Territory.

5.2. The Licensee agrees to credit the Licensor and the original producers in all promotional materials related to the Film(s).

ARTICLE VI – REPORTING AND AUDIT

6.1. The Licensee shall provide the Licensor with quarterly screening reports including the number of screenings, attendance figures, and detailed revenue breakdown, within 30 days after the end of each calendar quarter.

6.2. The Licensor shall have the right to audit the Licensee's records relating to the screenings of the Film(s) upon reasonable notice, no more than once per year.

ARTICLE VII – TERMINATION

7.1. Either Party may terminate this Agreement with 90 days written notice to the other Party.

7.2. The Licensor may terminate this Agreement immediately if the Licensee materially breaches any term of this Agreement and fails to remedy such breach within 30 days of written notice.

7.3. Upon termination, the Licensee shall cease all screenings, settle any outstanding revenue share payments, and delete/destroy all copies of the Film(s) within 30 days.

ARTICLE VIII – LIABILITY AND WARRANTIES

8.1. The Licensor warrants that it has the right and authority to grant the licence described in this Agreement.

8.2. The Licensor shall not be liable for any indirect, consequential, or incidental damages arising from the use of the Film(s).

ARTICLE IX – CONFIDENTIALITY

9.1. Both Parties agree to keep confidential the financial terms of this Agreement and any proprietary information exchanged during the course of this relationship.

ARTICLE X – GOVERNING LAW AND DISPUTE RESOLUTION

10.1. This Agreement shall be governed by and construed in accordance with the laws of the Czech Republic.

10.2. Any disputes arising from this Agreement shall be resolved first through good faith negotiations. If unresolved within 30 days, disputes shall be submitted to the competent courts of the Czech Republic.

ARTICLE XI – FINAL PROVISIONS

11.1. This Agreement constitutes the entire agreement between the Parties and supersedes all prior negotiations, representations, or agreements relating to this subject matter.

11.2. Any amendments to this Agreement must be made in writing and signed by both Parties.

11.3. This Agreement is executed in two counterparts, each Party receiving one.

11.4. This Agreement becomes effective upon signing by both Parties.


In Prague, on ${formatDate(d.signingDatePrague)}

_______________________________
Fulldome Film Society z.s.
Martin Juza, Director


In ${or(d.signingPlaceClient)}, on ${formatDate(d.signingDateClient)}

_______________________________
${or(d.clientName)}
${or(d.clientRepresentative)}`;
}

// ============================================================
// ONE+ – ANNUAL ONE-TIME (EN)
// ============================================================
function onePlusAnnual(d: ContractFormData): string {
  const filmsList = d.films.map((f, i) => filmTechBlock(f, i)).join("\n\n");

  return `ONE+ FULLDOME PROGRAMME AGREEMENT

entered into between:

Fulldome Film Society z.s. (hereinafter referred to as the "Provider")
Registered Office: Vyšehradská 320/49, Nusle, 128 00 Prague 2, Czech Republic
Business Registration Number: 06476317
Represented by: Martin Juza, Director

and

${or(d.clientName)} (hereinafter referred to as the "Subscriber")
Registered Office: ${or(d.clientAddress)}
Business Registration Number: ${or(d.clientBusinessId)}
Tax ID: ${or(d.clientTaxId)}
Registered at: ${or(d.clientRegisterCourt)}, Section ${or(d.clientRegisterSection)}, Entry ${or(d.clientRegisterEntry)}
Represented by: ${or(d.clientRepresentative)}

(each individually as the "Party" or collectively as the "Parties")

WHEREAS:

The Provider operates the One+ Fulldome Programme, offering subscribing planetariums and fulldome theaters access to a curated catalogue of fulldome films under a subscription model.

The Subscriber operates a fulldome theater/planetarium and wishes to subscribe to the One+ Programme to access the Film catalogue.

The Parties have agreed on the following terms:

ARTICLE I – DEFINITIONS

1.1. "One+ Programme" means the Provider's fulldome film subscription service that grants access to a catalogue of fulldome productions.

1.2. "Catalogue" means the current collection of fulldome films available under the One+ Programme, which may be updated by the Provider from time to time. The current catalogue includes:
${filmsList}

1.3. "Territory" means: ${or(d.territory)}

1.4. "Subscription Period" means: ${d.licenseUnlimited ? "Unlimited (perpetual)" : `from ${formatDate(d.licenseFrom)} to ${formatDate(d.licenseTo)}`}

ARTICLE II – SUBSCRIPTION AND LICENCE

2.1. The Provider hereby grants the Subscriber a non-exclusive licence to publicly screen films from the Catalogue in the Territory during the Subscription Period.

2.2. The Subscriber may screen the films to both public and school/educational audiences within the Territory.

2.3. As the Catalogue is updated, the Subscriber shall gain access to newly added films at no additional cost during the active Subscription Period.

2.4. The Subscriber shall not sublicence, distribute, copy, or make the films available to any third party without prior written consent of the Provider.

2.5. The Subscriber shall use the films solely for fulldome projection and shall not convert, edit, or modify any films without the prior written consent of the Provider.

ARTICLE III – SUBSCRIPTION FEE AND PAYMENT

3.1. The annual Subscription Fee is: ${or(d.feeAmount)} ${or(d.feeCurrency)}.

3.2. The Subscription Fee shall be paid annually in advance, within 30 days from the beginning of each subscription year.

3.3. Bank details:
   Account holder: Fulldome Film Society z.s.
   Bank: Fio banka, a.s.
   IBAN: CZ2120100000002902248837
   SWIFT/BIC: FIOBCZPPXXX

3.4. All payments shall be made free of any bank charges to the Provider. Any bank fees shall be borne by the Subscriber.

ARTICLE IV – DELIVERY

4.1. The Provider shall deliver the films to the Subscriber via ${d.deliveryMethod === "FTP" ? "FTP download link" : "external HDD (shipped at Subscriber's cost)"}.

4.2. New films added to the Catalogue shall be made available to the Subscriber within a reasonable time after their addition.

4.3. Upon delivery, the Subscriber shall confirm receipt and verify technical quality within 7 days.

ARTICLE V – PROMOTIONAL MATERIALS

5.1. The Provider shall provide the Subscriber with available promotional materials for each film in the Catalogue.

5.2. The Subscriber agrees to credit the Provider and original producers in all promotional materials.

ARTICLE VI – REPORTING

6.1. The Subscriber shall provide the Provider with annual screening reports including the number of screenings and attendance figures for each film, no later than January 31st of each calendar year for the preceding year.

ARTICLE VII – RENEWAL AND TERMINATION

7.1. The Subscription shall automatically renew for successive one-year periods unless either Party provides written notice of non-renewal at least 90 days before the end of the current Subscription Period.

7.2. Either Party may terminate this Agreement with 90 days written notice.

7.3. The Provider may terminate this Agreement immediately if the Subscriber materially breaches any term of this Agreement and fails to remedy such breach within 30 days of written notice.

7.4. Upon termination or non-renewal, the Subscriber shall cease all screenings and delete/destroy all copies of the films within 30 days, confirming such deletion in writing.

ARTICLE VIII – LIABILITY AND WARRANTIES

8.1. The Provider warrants that it has the right and authority to grant the licences described in this Agreement.

8.2. The Provider shall not be liable for any indirect, consequential, or incidental damages.

ARTICLE IX – CONFIDENTIALITY

9.1. Both Parties agree to keep confidential the financial terms of this Agreement.

ARTICLE X – GOVERNING LAW AND DISPUTE RESOLUTION

10.1. This Agreement shall be governed by and construed in accordance with the laws of the Czech Republic.

10.2. Any disputes shall be resolved first through good faith negotiations. If unresolved within 30 days, disputes shall be submitted to the competent courts of the Czech Republic.

ARTICLE XI – FINAL PROVISIONS

11.1. This Agreement constitutes the entire agreement between the Parties.

11.2. Any amendments must be made in writing and signed by both Parties.

11.3. This Agreement is executed in two counterparts, each Party receiving one.

11.4. This Agreement becomes effective upon signing by both Parties.


In Prague, on ${formatDate(d.signingDatePrague)}

_______________________________
Fulldome Film Society z.s.
Martin Juza, Director


In ${or(d.signingPlaceClient)}, on ${formatDate(d.signingDateClient)}

_______________________________
${or(d.clientName)}
${or(d.clientRepresentative)}`;
}

// ============================================================
// ONE+ – MONTHLY INSTALLMENTS (EN)
// ============================================================
function onePlusMonthly(d: ContractFormData): string {
  const base = onePlusAnnual(d);

  const monthlyPayment = `3.1. The annual Subscription Fee is: ${or(d.feeAmount)} ${or(d.feeCurrency)}, payable in monthly installments of ${or(d.monthlyAmount)} ${or(d.feeCurrency)}.

3.2. Monthly installments shall be paid by the Subscriber by the 15th of each calendar month.`;

  return base.replace(
    /3\.1\. The annual Subscription Fee is:.*?\n\n3\.2\. The Subscription Fee shall be paid.*?subscription year\./s,
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
