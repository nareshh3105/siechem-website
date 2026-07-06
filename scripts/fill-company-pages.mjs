/**
 * Fills the 13 Company stub pages with real content scraped from
 * https://www.siechem.com/company/* (About Us is already done separately).
 *
 * Each stub page has a "Content Coming Soon" section; this script replaces
 * that section with page-specific content markup that uses theme.css classes.
 *
 * Run:  node scripts/fill-company-pages.mjs
 */
import fs from 'node:fs';

/* Shared building blocks */
const prose = inner => `  <section class="section-padding">
    <div class="container">
      <div style="max-width: 800px;">
${inner}
      </div>
    </div>
  </section>`;

const proseWide = inner => `  <section class="section-padding">
    <div class="container">
${inner}
    </div>
  </section>`;

const P = t => `        <p style="font-size:15.5px;line-height:1.75;color:var(--text-muted);margin-bottom:18px;">${t}</p>`;

const CONTENT = {
  /* ─────────────────────────── MD's Message ─────────────────────────── */
  'mds-message.html': prose(`
        <div style="border-left:3px solid var(--accent);padding-left:24px;margin-bottom:28px;">
${P(`Welcome to the Siechem's website. We did grow steadily since inception and have become India's No.1 Speciality Wire &amp; Cable manufacturer. Our objective is to be the first preferred partner for all your wires &amp; cables requirements, delivering the best value the industry can offer in terms of pricing, quality, timely delivery and best after-sales support.`)}
${P(`Proudly we can say that we never lost any customer since 2002 when we started our manufacturing activity in Pondicherry, India. Our products serve 32 different market segments which include leading corporates, Govt. companies, builders, contractors and dealers as our esteemed customers.`)}
${P(`We would be pleased to design, manufacture and supply most complex wires &amp; cables against your specific requirements. Our in-house capabilities are such that we can design, manufacture and supply wires &amp; cables to any international standards in our automated plant. We strictly practice and follow ethical values and green environment norms, optimizing production processes, avoiding hazardous substances at every stage of manufacturing.`)}
${P(`We hope you will find this website helpful and easy to navigate. In case you have any difficulty in getting the exact information that you may need, please do not hesitate to contact us. We will respond as quickly as possible. Thanks for your visit to our site and we look forward to working with you as our esteemed customer.`)}
        </div>
        <div style="display:flex;flex-direction:column;gap:2px;">
          <span style="font-size:17px;font-weight:800;color:var(--text);">P. Damodaren</span>
          <span style="font-family:var(--mono);font-size:12px;color:var(--accent-2);letter-spacing:0.08em;text-transform:uppercase;">Managing Director</span>
        </div>`),

  /* ─────────────────────────── Key Persons ──────────────────────────── */
  'key-persons.html': proseWide(`
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px;">
${[
  ['P. Damodaren', 'Managing Director'],
  ['D. Padma', 'Director'],
  ['G.M. Arunkumar', 'Executive Director'],
  ['P. Patanjali', 'Adviser (Engineering)'],
  ['N. Samar Paul', 'Head (R&amp;D)'],
  ['A.K.S. Nair', 'Advisor (Technical)'],
  ['D. Rohit', 'Vice President (Projects)'],
  ['D. Pooja', 'Vice President (Business Development)'],
  ['L.S. Deepikaa', 'Vice President (Finance)'],
  ['V. Ganash', 'General Manager (Sales &amp; Marketing)'],
  ['Nataraj', 'Manager (QC)'],
  ['A.S. Vasantha Kumar', 'Plant Manager'],
  ['Hrudananda Mahanta', 'Plant Manager'],
  ['J. Hemalatha', 'Dy. Manager (Sourcing)'],
  ['Arun Ramachandran', 'Manager (QMS)'],
  ['W. D. Hari Prasad', 'Manager (Tender)'],
  ['B. Devipriya', 'Manager (Tech Support)'],
  ['V. Dhivakar', 'Manager (MRP)'],
  ['Anto Sujesh', 'Manager (ERP)'],
  ['K. Mangaiyarkarasi', 'Asst. Manager (Tech Support)'],
  ['M. Subramanian', 'Regional Manager (Marketing)']
].map(([n, t]) => `        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:18px 20px;">
          <div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:4px;">${n}</div>
          <div style="font-family:var(--mono);font-size:11px;color:var(--accent-2);letter-spacing:0.06em;text-transform:uppercase;">${t}</div>
        </div>`).join('\n')}
      </div>`),

  /* ─────────────────────── Manufacturing Facility ───────────────────── */
  'manufacturing-facility.html': prose(`
${P(`Siechem has an in-house manufacturing facility for wires and cables and heat shrinkable tubings, with state-of-the-art machineries imported from Europe, Russia and the USA, alongside equipment procured from indigenous sources. From Copper/Aluminium rod drawing to the final stage of manufacture, the wires and cables are fully produced in the Pondicherry factory, situated about 140&nbsp;km from Chennai airport.`)}
${P(`Siechem's present production capacity is about 12,000 metric tons of Copper/Aluminium wires and cables per annum. The same is under expansion to reach 24,000 metric tons — in other words, about 3,000&nbsp;km of cables per day.`)}
${P(`Siechem's strength is that it has its own cable studio to develop any type of design in 2D or 3D, plus in-house R&amp;D, Electron Beaming, Electro Tinning, compound manufacturing and complete cable manufacturing — from wire drawing, bunching/stranding, insulation, laying up, sheathing, taping, braiding/armouring, jacketing to printing — without depending on any external sources, ensuring the quality of every product supplied.`)}
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-top:32px;">
${[
  ['100,000 sq.ft', 'Pondicherry plant built-up area'],
  ['12,000 MT/yr', 'Current capacity, expanding to 24,000 MT'],
  ['10,000 km/day', 'Wires &amp; cables of assorted sizes'],
  ['300,000 sq.ft', 'Bhiwadi campus — operational Dec 2026']
].map(([v, l]) => `          <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:20px;">
            <div style="font-size:22px;font-weight:800;color:var(--accent);letter-spacing:-0.5px;">${v}</div>
            <div style="font-size:12.5px;color:var(--text-muted);margin-top:6px;line-height:1.5;">${l}</div>
          </div>`).join('\n')}
        </div>`),

  /* ───────────────────────── Testing Facilities ─────────────────────── */
  'testing-facilities.html': prose(`
${P(`Siechem maintains comprehensive in-house testing capabilities aligned with international and Indian standards for wires and cables. Every product is verified in our laboratory before despatch, covering electrical, mechanical, thermal and fire-performance parameters.`)}
        <h3 style="font-size:16px;font-weight:800;margin:28px 0 14px;">Standards Our Laboratory Supports</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px;">
${[
  ['AS/NZS', 'AS/NZS 1660 series, AS/NZS 5000 parts and IEC equivalents'],
  ['European (BS EN / VDE / IEC)', 'EN 50525 series, EN 50264, EN 50306, BS 7846'],
  ['North American (UL / CSA)', 'UL 758, UL 44, UL 1581 and related safety specs'],
  ['Automotive', 'SAE J1128, SAE J1939, ISO 6722-1, DIN 72551-6'],
  ['Military / Defence', 'MIL-W-22759E, MIL-DTL-27500H, MIL-W-16878, DEF-STAN'],
  ['Railway / Marine', 'IEC 60092 series, RDSO and rolling stock standards'],
  ['Renewable Energy', 'TUV 2Pfg 1169/08.2007 and EN 50618 solar cable testing'],
  ['Indian Standards', 'IS 2465, IS 694, IS 1554-1, IS 7098 series, IRS']
].map(([k, v]) => `          <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:16px 18px;">
            <div style="font-family:var(--mono);font-size:12px;font-weight:700;color:var(--accent-2);margin-bottom:6px;">${k}</div>
            <div style="font-size:13px;color:var(--text-muted);line-height:1.55;">${v}</div>
          </div>`).join('\n')}
        </div>`),

  /* ─────────────────────── Research & Development ───────────────────── */
  'research-development.html': prose(`
${P(`Siechem's in-house R&amp;D is recognized by the Govt. of India, Ministry of Science &amp; Technology — one of the most prestigious approvals the company has received. Siechem's R&amp;D team, manned by well-experienced and young technocrats, is engaged in the development of more than 23 million part numbers of wires and cables covering 34 different segments, has registered many patents and published technical papers.`)}
${P(`The team is continuously working on finding alternate materials which are environmentally friendly and on improving process optimization. As the market leader in the speciality wires and cables segment in India, Siechem's R&amp;D team is engaged in the reduction of emission and pollution, and in customer-specific development of wires &amp; cables to reduce weight, improve flexibility and enhance Oil, Chemical, UV, Ozone, Electrical, Mechanical, Thermal &amp; Fire resistance properties — without compromising quality, environmental and safety standards.`)}
${P(`Siechem spends about 5% of its revenue annually on R&amp;D projects. Our R&amp;D team has a handful of new projects, as always.`)}
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;margin-top:32px;">
${[
  ['5%', 'of annual revenue invested in R&amp;D'],
  ['23M+', 'part numbers developed'],
  ['34', 'market segments covered'],
  ['DSIR', 'recognized by Ministry of Science &amp; Technology']
].map(([v, l]) => `          <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:20px;">
            <div style="font-size:24px;font-weight:800;color:var(--accent);letter-spacing:-0.5px;">${v}</div>
            <div style="font-size:12.5px;color:var(--text-muted);margin-top:6px;line-height:1.5;">${l}</div>
          </div>`).join('\n')}
        </div>`),

  /* ───────────────────────── Ethical Values ─────────────────────────── */
  'ethical-values.html': prose(`
${P(`Siechem's management is committed to being ethically and morally responsible to all those who are dealing with the company. The management is also keen to ensure its employees are responsible, accountable, dependable, kind and caring to all those with whom the company is dealing.`)}
${P(`We strictly practice and follow ethical values and green environment norms — optimizing production processes and avoiding hazardous substances at every stage of manufacturing.`)}`),

  /* ───────────────────────── Mission & Vision ───────────────────────── */
  'mission-vision.html': prose(`
        <div style="background:var(--bg-card);border:1px solid var(--border);border-left:4px solid var(--accent);border-radius:14px;padding:36px 40px;">
          <p style="font-size:20px;line-height:1.7;font-weight:600;color:var(--text);font-style:italic;">
            &ldquo;To grow globally as market leader in speciality wires &amp; cables with continuous R&amp;D, improvement in environmental &amp; safety standards, quality practices, optimizing processes to manufacture and deliver zero defect products with satisfied customers &amp; employees.&rdquo;
          </p>
        </div>`),

  /* ──────────────────────────────── PPT ─────────────────────────────── */
  'ppt.html': prose(`
${P(`Download the Siechem corporate PowerPoint presentation for an overview of our company, capabilities, product range and quality systems.`)}
        <a href="https://www.siechem.com/company/ppt/" target="_blank" rel="noopener" class="btn btn-primary" style="color:#fff;">
          Download Corporate Presentation
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M7 1v8M4 6l3 3 3-3M2 12h10"/></svg>
        </a>`),

  /* ────────────────────────────── Policies ──────────────────────────── */
  'policies.html': prose(`
${P(`Siechem operates under a documented set of corporate policies covering quality, environment, health &amp; safety, energy, information security and product safety. Copies of any policy are available on request.`)}
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:8px;">
${[
  'CMRT Policy',
  'Quality Policy',
  'Environment Policy',
  'Health and Safety Policy',
  'Energy Policy',
  'ISMS Policy',
  'Product Safety Policy'
].map((p, i) => `          <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:14px 20px;">
            <div style="display:flex;align-items:center;gap:14px;">
              <span style="font-family:var(--mono);font-size:12px;color:var(--text-faint);">${String(i + 1).padStart(2, '0')}</span>
              <span style="font-size:14.5px;font-weight:600;color:var(--text);">${p}</span>
            </div>
            <a href="mailto:sales@siechem.com?subject=Request%20for%20${encodeURIComponent(p)}" style="font-size:12.5px;font-weight:700;color:var(--accent);white-space:nowrap;">Request a Copy →</a>
          </div>`).join('\n')}
        </div>`),

  /* ──────────────────────────────── CSR ─────────────────────────────── */
  'csr.html': prose(`
${P(`Siechem is committed to the needs of society and to enriching people's lives with ethical values — no matter whether they are an employee, vendor, customer, banker or a private/government agency. Siechem will never lose sight of its gratitude towards all those who helped the company.`)}
${P(`Siechem believes that its business should contribute positively to society, to develop economic growth &amp; all-round prosperity, and also to create more and more business and employment opportunities. Siechem is committed to social, environmental, safety and ethical practices with a sense of corporate responsibility.`)}`),

  /* ────────────────────────────── Careers ───────────────────────────── */
  'careers.html': prose(`
${P(`Siechem is India's No. 1 speciality wire &amp; cable company. Freshers as well as experienced candidates can apply from anywhere in the world. In case we do not find a suitable position for you now, your application with resume will help us contact you as and when we can.`)}
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:14px;padding:28px 32px;margin-top:8px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:18px;">
          <div>
            <div style="font-size:16px;font-weight:800;color:var(--text);margin-bottom:4px;">Send us your resume</div>
            <div style="font-size:13.5px;color:var(--text-muted);">We review every application and reach out when a role matches.</div>
          </div>
          <a href="mailto:hr@siechem.com" class="btn btn-primary" style="color:#fff;">hr@siechem.com</a>
        </div>`),

  /* ────────────────────────────── Events ────────────────────────────── */
  'events.html': proseWide(`
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;">
${[
  ['InnoTrans, Berlin', 'September 2018', 'International trade fair for transport technology'],
  ['International Rail Coach Expo, ICF Chennai', 'May 2018', 'Rolling stock and rail coach industry expo'],
  ['JITO Connect, B &amp; C Mills (Binny), Chennai', 'February 2018', 'Business networking summit'],
  ['ELECXPO, Chennai', '2016', 'Electrical &amp; electronics industry exhibition'],
  ['InnoTrans, Berlin', '2016', 'International trade fair for transport technology'],
  ['Misterlight Solar', '—', 'Solar energy exhibition participation'],
  ['InnoTrans, Berlin', '2014', 'International trade fair for transport technology'],
  ['InnoTrans, Berlin', '2012', 'International trade fair for transport technology']
].map(([name, date, desc]) => `        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:20px 22px;">
          <div style="font-family:var(--mono);font-size:11px;color:var(--accent-2);letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px;">${date}</div>
          <div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:6px;">${name}</div>
          <div style="font-size:13px;color:var(--text-muted);line-height:1.55;">${desc}</div>
        </div>`).join('\n')}
      </div>`),

  /* ─────────────────────────── Privacy Policy ───────────────────────── */
  'privacy-policy.html': prose(`
${P(`This policy governs data collection and usage on the website www.siechem.com provided by Siechem Technologies Private Limited. By using the services, you consent to accept the practices described in this policy. If you do not agree with the policy, then you should stop accessing the services.`)}
${[
  ['Personal Information', `Personal information refers to any data that identifies, relates to, describes, or can reasonably be linked, directly or indirectly, to a particular consumer or household. This includes, but is not limited to, your name, position, company, city, country, telephone number, email address, and other information you voluntarily provide through website forms or communications.`],
  ['Personal Data Collection', `Our websites and publicly hosted services collect personal data that you voluntarily provide, as well as data generated automatically through your interaction with our services, such as time of access, IP address, browser type, and other usage details.`],
  ['Use of Personal Data', `We collect data that is essential to fulfil the offered services or to provide targeted support services to you. We may also use the data aggregates in future to improve the quality of our products and services.`],
  ['Disclosure', `We do not sell or trade your personal data to third parties. We do not otherwise transfer your personal data to third parties without obtaining your explicit consent. We may release your personal data when we believe release is appropriate to comply with a law or judicial directive or to protect our or other rights, property or safety.`],
  ['Limitation', `Our websites or services may link to third-party sites or services. We are not responsible for privacy practices or data collection by such third parties.`],
  ['Data Protection', `Our sites or services may be hosted on third-party data centres. We take reasonable steps to ensure your data is stored securely in line with this policy.`],
  ['How to access, obtain a copy or delete your information', `To obtain a copy of your data or to delete it, we request you to please write to <a href="mailto:erp@siechem.com" style="color:var(--accent);">erp@siechem.com</a>.`],
  ['Cookies', `Our sites may use cookies to improve your browsing experience. You may disable cookies in your browser, but some features may not function correctly.`],
  ['Consent', `By using our websites or services, you consent to our Privacy Policy and its terms.`],
  ['Updates', `We may revise this policy periodically in line with regulatory or operational changes. Please check this page regularly for updates.`],
  ['Grievances', `If you have any questions about this privacy policy or want to report a grievance in a matter falling under this policy, please contact us at:<br><br>Legal Team<br>Siechem Technologies Private Limited,<br>26/27, Errabalu Chetty Street,<br>Chennai – 600 001, India.<br>Tel: +91 44 25226141 / 25220859<br>Email: <a href="mailto:legal@siechem.com" style="color:var(--accent);">legal@siechem.com</a>`]
].map(([h, b]) => `        <h3 style="font-size:16px;font-weight:800;margin:26px 0 10px;">${h}</h3>
${P(b)}`).join('\n')}`)
};

let done = 0;
for (const [file, sectionHtml] of Object.entries(CONTENT)) {
  let s = fs.readFileSync(file, 'utf8');
  const re = /  <section class="section-padding">[\s\S]*?stub-coming[\s\S]*?<\/section>/;
  if (!re.test(s)) { console.log('STUB NOT FOUND:', file); continue; }
  s = s.replace(re, sectionHtml);
  fs.writeFileSync(file, s);
  done++;
}
console.log('pages filled:', done, '/', Object.keys(CONTENT).length);
