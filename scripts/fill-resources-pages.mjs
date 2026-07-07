/**
 * Fills 13 of the 14 Resources stub pages (res-*.html) with content copied
 * from www.siechem.com/resources/*. res-covid19.html is left as a stub —
 * the original page publishes no content at all.
 *
 * Metal Trend: the old site renders live LME copper/aluminium rates via a
 * server-side PHP proxy we can't copy; we embed the dailymetalprice.com
 * charts (the same widget the old page references) instead.
 *
 * Run:  node scripts/fill-resources-pages.mjs
 */
import fs from 'node:fs';

const P = t => `        <p style="font-size:15.5px;line-height:1.75;color:var(--text-muted);margin-bottom:18px;">${t}</p>`;
const H = t => `        <h3 style="font-size:16px;font-weight:800;margin:26px 0 12px;">${t}</h3>`;
const UL = items => `        <ul style="margin:0 0 18px 20px;display:flex;flex-direction:column;gap:7px;font-size:14.5px;line-height:1.6;color:var(--text-muted);">
${items.map(i => `          <li>${i}</li>`).join('\n')}
        </ul>`;
const IMG = (src, alt, extra = '') => `        <img src="${src}" alt="${alt}" loading="lazy" style="width:100%;height:auto;display:block;border:1px solid var(--border);border-radius:12px;${extra}" />`;

const section = inner => `  <section class="section-padding">
    <div class="container">
      <div style="max-width:820px;margin:0 auto;">
${inner}
      </div>
    </div>
  </section>`;

const CONTENT = {
  'res-5s': section(`
${P(`We, in Siechem implement 5S. This has helped us to a great extent though not very easy to practice day in day out. Siechem management is fully committed to Japanese 5S practices and behind every employee to see that it is in force.`)}
${IMG('assets/resources/5s.png', 'Siechem 5S practice', 'max-width:640px;margin:0 auto;')}`),

  'res-awards': section(`
${UL([
  'Awards from Yazaki KAIZEN competition',
  'Awards from Yes Bank as most valued customer',
  `Recognized by Dun &amp; Bradstreet with a 'Good (2)' ranking in Environmental, Social, and Governance (ESG) performance.`
])}`),

  'res-capabilities': section(`
${P(`Siechem's strength is to develop 2D or 3D views of the most complex cable, with in-house R&amp;D (Design &amp; Compounding), Electron Beaming, Electro Tinning, compound manufacturing and complete cable manufacturing — from wire drawing, bunching or stranding, insulation, laying up, sheathing, taping, braiding or armouring, jacketing to printing — without depending on any external sources, to ensure the quality of its products supplied.`)}
${P(`Our quality assurance system has received certification of compliance from various testing agencies: ISO 9001:2015, ISO 45001, ISO 14001:2015, ISO/TS 16949, ISI, CSA, ABS, TUV, RDSO, Lloyd's Register, ALSTOM, Ford, UL, ESMA, CE, IRS, DGQA &amp; Indian Navy.`)}
${H('Conductors')}
${UL(['Annealed Plain (Bare) Copper Conductor','Annealed Tinned Copper Conductor','Silver Plated Copper Conductor','Nickel Plated Copper Conductor','Copper Clad Steel','Aluminium Conductor'])}
${H('Compounds')}
${UL([
  'EBXL-XLPE (Electron Beam Cross-Linked Polyethylene)',
  'EBXL-EPDM (Electron Beam Cross-Linked EPDM Rubber)',
  'EBXL-LSZH (Electron Beam Cross-Linked Low Smoke Zero Halogen)',
  'XLPE (Cross-Linked Polyethylene)',
  'EBXL-XLPO (Electron Beam Cross-Linked Polyolefin)',
  'EBXL-PVC (Electron Beam Cross-Linked Polyvinylchloride)',
  'EPDM+LFH (EPDM Rubber + Limited Fire Hazard Compound)',
  'EBXL-EPR (Electron Beam Cross-Linked Ethylene Propylene)',
  'PVC / HR PVC / FR PVC / PVC FRLS',
  'ACW for Class D Automotive wires · PW 125 for Panel wires',
  'PE / HDPE / LDPE / PP',
  'Silicone Rubber (Type EI 2, EI 111, EI 112, EM 9, EM 105, EM 106 &amp; EM 107)',
  'Neoprene · Cellular PE · Nylon · other conventional elastomeric compounds',
  'EBXL-EI 109 / EI 111 / EI 112 (Extra Low Temperature, Oil &amp; Fuel Resistant grades)',
  'EBXL-EVA · EBXL-CPE · EBXL-LFH · EPR-LFH',
  'EVA · EEA · EMA · Polyamide',
  'ETFE · FEP · PFA · PTFE · PEEK · PVDF',
  'TPE · TPR · TPO · TPU'
])}
${H('Special Services')}
${UL([
  'Electron Beam Cross Linking of wires &amp; cables',
  'Twisting for unilay &amp; standard bunched conductor in cable',
  'Cellular insulation with skinning · Bicolour insulation with stripe',
  'Shielding: Al.Mylar ATC/APC Braid &amp; Spiral · Drain Wire: ATC/APC',
  'Taping · Customised labelling · Printing',
  'Harness · Power cords',
  'Complete in-house testing · Cable design as per customer requirements',
  'Packaging / Labelling · Export Packaging / Documentation',
  'REACH &amp; RoHS compliance'
])}`),

  'res-cricket-teams': section(`
${P(`Siechem Corporate Cricket Team is one of the strongest in world cricket. We have many international and First Class cricketers playing for our cricket teams listed below:`)}
${UL([
  'Chilaw Marians CC in Colombo — a First Class team affiliated to Sri Lanka Cricket',
  'Triplicane Sports Club — a 1st division team in the TNCA Chennai league',
  'Rising Stars CC and BRC — both 3rd division teams in the TNCA Chennai league',
  'Siechem CC — affiliated to the Cricket Association of Pondicherry'
])}
${P(`Chilaw Marians CC won an international inter-club tournament at Kuala Lumpur, Malaysia in September 2016.`)}
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px;margin:24px 0;">
${IMG('assets/resources/cricket-panthers-meet.jpg', 'Siechem Madurai Panthers 1st Meet & Greet at Crowne Plaza, 3 June 2018')}
${IMG('assets/resources/cricket-icf-ground.jpg', 'ICF Flood-lit Cricket Ground inaugurated 26 May 2018')}
${IMG('assets/resources/cricket-team-2018.jpg', 'Siechem cricket team 2018')}
${IMG('assets/resources/cricket-4.jpg', 'Siechem cricket team')}
${IMG('assets/resources/cricket-5.jpg', 'Siechem cricket team')}
        </div>
        <p style="font-size:13px;color:var(--text-faint);margin-bottom:12px;">Siechem Madurai Panthers 1st Meet &amp; Greet at Crowne Plaza on 3rd June 2018 · ICF Flood-lit Cricket Ground inaugurated on 26/05/2018</p>
        <a href="assets/resources/cricket-sponsorship-brochure.pdf" target="_blank" rel="noopener" class="btn btn-primary" style="color:#fff;">
          Download Sponsorship Brochure (PDF)
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M7 1v8M4 6l3 3 3-3M2 12h10"/></svg>
        </a>`),

  'res-customer-care': section(`
${P(`Siechem is committed to take care of customer needs in every aspect in terms of its products, performance, services, packing, marking, timely delivery and adhering to the committed terms. Our priority is to satisfy the customer in all aspects as they are the stakeholders of the company.`)}
${P(`We go the extra mile to keep customers happy and offer good value for their money. Siechem management is keen to look after every customer as our extended family member.`)}
${P(`In order to keep the customer well informed, the Siechem ERP team is developing a net-based ERP that gives customers access to the current status of their purchase orders — indicating at what stage their order is being processed, schedule of despatch, etc. The ERP team is also working to give an e-inspection facility to customers through video conferencing before despatch for the wires &amp; cables ordered, if so specified.`)}
${P(`As soon as we complete the software development, this site will provide the above information to customers. Kindly send your comments to <a href="mailto:sales@siechem.com" style="color:var(--accent);">sales@siechem.com</a>.`)}`),

  'res-customer-comments': section(`
${P(`Transparency in dealing with customers is the key to having repeated business from customers. Siechem has never lost a customer since its inception due to unsatisfactory products or services offered.`)}
${P(`We believe the company's stakeholders are our customers, and all customers are our extended family members. Our aspiration to grow is through the quality of our products supplied and services offered — to be the most admired as well as preferred cable manufacturer.`)}
${P(`In order to maintain an excellent track record of customer satisfaction and continued business relationships, we request customers to frankly write what they think about us and about our products/services. This helps us improve once every issue is brought to our notice. Kindly send your comments to <a href="mailto:helpdesk@siechem.com" style="color:var(--accent);">helpdesk@siechem.com</a>.`)}`),

  'res-green-technology': section(`
${P(`Siechem practices clean and green technology in manufacturing its products &amp; services by:`)}
${UL([
  'Process optimization',
  'Ecological optimization',
  'Finding alternate environment friendly materials',
  'Avoiding restricted hazardous substances',
  'Restricting emission and pollution',
  'Environment friendly initiatives',
  'Meeting RoHS and REACH norms'
])}`),

  'res-metal-trend': section(`
${P(`Live copper and aluminium price trends (LME reference). On the original siechem.com site these rates are computed server-side; the charts below are provided by dailymetalprice.com for the same indicative purpose.`)}
        <div style="display:flex;flex-direction:column;gap:20px;margin-top:8px;">
          <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:16px;">
            <h3 style="font-size:14px;font-weight:800;margin-bottom:10px;">Copper (USD/kg)</h3>
            <div data-pym-src="https://dailymetalprice.com/charts.php?c=cu&u=kg"></div>
          </div>
          <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:16px;">
            <h3 style="font-size:14px;font-weight:800;margin-bottom:10px;">Aluminium (USD/kg)</h3>
            <div data-pym-src="https://dailymetalprice.com/charts.php?c=al&u=kg"></div>
          </div>
        </div>
        <script src="https://dailymetalprice.com/js/pym.min.js" defer></script>`),

  'res-part-number-index': section(`
${P(`Siechem has quite a large number of part numbers for its finished products. In order to get clarity on this long list, the Siechem ERP team is working on suitable software that answers your questions. This site is under testing and we will make this facility available to you as soon as possible.`)}
${P(`Presently Siechem has <strong>22 million part numbers</strong>. Meanwhile, you can browse and filter the complete range in our <a href="products.html" style="color:var(--accent);font-weight:600;">product catalogue</a>.`)}`),

  'res-reach': section(`
${P(`REACH is a European Union (EU) regulation governing the <strong>R</strong>egistration, <strong>E</strong>valuation, <strong>A</strong>uthorization and Restriction of <strong>Ch</strong>emicals. Siechem is committed to strictly follow R.E.A.C.H. regulations and its products meet R.E.A.C.H. norms.`)}`),

  'res-rohs': section(`
${P(`RoHS is the acronym for Restriction of Hazardous Substances. RoHS, also known as Directive 2002/95/EC, originated in the European Union and restricts the use of specific hazardous materials found in electrical and electronic products. Siechem follows RoHS standards and its products meet RoHS norms.`)}`),

  'res-siechem-erp': section(`
${P(`Siechem has developed an in-house ERP, customized to its own needs. This software division is called "Siechem ERP". The main objective of the Siechem ERP team is to provide seamless access between our offices, factory, vendors, customers and bankers.`)}
${P(`Siechem ERP helps us at every stage of operation with instant information, reports, traceability, first-in first-out, process monitoring, operator and machine efficiency, video conferencing and more. Continuous efforts are on to offer a world-class e-inspection facility to our customers for the wires &amp; cables they order.`)}`),

  'res-un-global-compact': section(`
${P(`Siechem is a participant of the United Nations Global Compact.`)}
${IMG('assets/resources/un-global-compact.jpg', 'United Nations Global Compact', 'max-width:482px;margin:0 auto;')}`)
};

const stubRe = /  <section class="section-padding">\r?\n\s*<div class="container">\r?\n\s*<div class="stub-coming">[\s\S]*?<\/section>/;

let done = 0;
for (const [page, html] of Object.entries(CONTENT)) {
  let s = fs.readFileSync(page + '.html', 'utf8');
  if (!stubRe.test(s)) { console.log('STUB NOT FOUND:', page); continue; }
  s = s.replace(stubRe, html);
  fs.writeFileSync(page + '.html', s);
  done++;
}
console.log('pages filled:', done, '/', Object.keys(CONTENT).length, '(res-covid19 intentionally left as stub — old page is empty)');
