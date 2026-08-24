import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing use of ClientFold.",
  alternates: { canonical: "/terms" },
};

const sections: LegalSection[] = [
  {
    title: "The agreement",
    content: <>
      <p>These Terms of Service form a binding agreement between the person or organisation using ClientFold (the <b>Customer</b>, <b>you</b> or <b>your</b>) and the ClientFold operator identified on your order form, checkout page or subscription receipt (<b>ClientFold</b>, <b>we</b>, <b>us</b> or <b>our</b>).</p>
      <p>They apply to the ClientFold website, application, client portals and related services (together, the <b>Service</b>). The <a href="/acceptable-use">Acceptable Use Policy</a>, <a href="/privacy">Privacy Notice</a>, <a href="/cookies">Cookie Notice</a> and any order or plan details presented at purchase are incorporated where relevant.</p>
      <p>If an order form expressly conflicts with these terms, the order form controls for that conflict. Headings are for convenience and examples do not limit the wording that precedes them.</p>
    </>,
  },
  {
    title: "Who may use ClientFold",
    content: <>
      <p>The Service is intended for business and professional use by people aged 18 or over. If you accept these terms for a company or other organisation, you confirm that you have authority to bind it. If you do not have that authority, you must not accept these terms on its behalf.</p>
      <p>You may allow employees, contractors and other authorised team members to use your workspace. You remain responsible for their compliance with this agreement and for deciding the access each person should have.</p>
    </>,
  },
  {
    title: "Accounts and access",
    content: <>
      <p>You must provide accurate, current information, keep credentials and devices secure, and promptly tell us at <a href="mailto:security@useclientfold.com">security@useclientfold.com</a> if you suspect unauthorised access. You are responsible for activity under your account unless it results from our breach of this agreement.</p>
      <p>Workspace owners and administrators control membership, roles, projects and client invitations. Invitation and portal links must be sent only to intended recipients. Client access can be revoked, and you should review access whenever a working relationship or project ends.</p>
      <p>We may require reasonable verification before changing ownership, billing details or administrator access. One person must not create accounts through bots or use false identities to bypass plan limits.</p>
    </>,
  },
  {
    title: "The Service",
    content: <>
      <p>ClientFold provides tools for managing client projects, files, messages, approvals, reminders, invoices and related activity. Features, storage, user allowances and usage limits depend on the selected plan.</p>
      <p>We may maintain, improve or change the Service to address security, law, technology or customer needs. We will not materially reduce the core functionality of a paid plan during its current billing period without reasonable notice, except where an urgent legal or security issue requires faster action.</p>
      <p>We aim to keep the Service available, but maintenance, faults and matters outside our reasonable control may cause interruptions. We do not promise uninterrupted or error-free operation. Support channels and response times are those described for your plan; response times are targets unless an order form says otherwise.</p>
    </>,
  },
  {
    title: "Trials, previews and beta features",
    content: <>
      <p>We may offer free plans, trials, previews or beta features. They may be changed, limited or withdrawn at any time and may be less reliable than generally available features. Unless we say otherwise, they are provided without service commitments and should not be used as the sole location for business-critical information.</p>
      <p>We may use feedback about a preview to improve the Service, but you are not required to provide feedback. Any confidential preview information must be treated as confidential until we make it public.</p>
    </>,
  },
  {
    title: "Fees, taxes and renewal",
    content: <>
      <p>Prices, billing intervals, plan limits and any trial period are shown before purchase. Unless stated otherwise, fees are charged in advance and paid subscriptions renew automatically for the same billing interval until cancelled. You authorise our payment provider to charge the payment method on file for renewal fees and applicable taxes.</p>
      <p>You are responsible for taxes, duties and similar charges arising from your purchase, excluding taxes on our income. If a payment is overdue, we may retry it, restrict paid features or suspend the account after reasonable notice. You remain responsible for amounts accrued before suspension or cancellation.</p>
      <p>We may change prices on reasonable advance notice. A price change applies from your next renewal after the notice period, so you may cancel before it takes effect.</p>
    </>,
  },
  {
    title: "Cancellation and refunds",
    content: <>
      <p>You may cancel a paid subscription at any time through billing settings or by contacting us. Cancellation stops the next renewal; paid access normally continues until the end of the current billing period.</p>
      <p>Except where our <a href="/refunds">Refund and Cancellation Policy</a>, an order, promotional offer or applicable law says otherwise, fees already paid are non-refundable and we do not give credits for partial periods or unused capacity. If we terminate the Service for reasons unrelated to your breach, we will refund prepaid fees for the unused portion of the affected paid period.</p>
      <p>Nothing in these terms removes a cancellation, refund or other right that cannot legally be excluded.</p>
    </>,
  },
  {
    title: "Invoices and client payments",
    content: <>
      <p>ClientFold can help you prepare and present invoices and direct clients to payment services. You—not ClientFold—are the seller of your goods or services and are responsible for invoice accuracy, tax treatment, payment terms, refunds, disputes and your relationship with each client.</p>
      <p>Card and connected-account services are provided by Stripe. Your use of those services is also subject to the applicable Stripe agreement. Payment availability, settlement, reserves, verification and chargebacks are controlled by Stripe and the relevant financial institutions.</p>
      <p>ClientFold is not a bank, accountant, tax adviser, escrow service or regulated payment institution. Information shown in the Service does not replace your own accounting records or professional advice.</p>
    </>,
  },
  {
    title: "Your content",
    content: <>
      <p><b>Customer Content</b> means information, files, messages, contact details, approvals, invoice data and other material submitted to the Service by you, your team or invited clients. You retain ownership of Customer Content. You grant us a worldwide, non-exclusive licence to host, copy, transmit, display and otherwise process it only as needed to provide, secure, support and improve the Service, comply with law and enforce this agreement.</p>
      <p>You confirm that you have the rights and lawful basis needed to submit Customer Content and allow us to process it. You are responsible for its accuracy, legality and suitability, for giving required notices to clients, and for configuring access appropriately.</p>
      <p>We do not acquire ownership of Customer Content or use confidential workspace content for third-party advertising. You should retain an independent copy of business-critical material and export records you must keep for legal, tax or professional purposes.</p>
    </>,
  },
  {
    title: "Data processing terms",
    content: <>
      <p>For personal data in Customer Content, you are normally the controller and ClientFold is your processor. This section is the parties’ data processing agreement for that processing. It applies for as long as we process that data to provide the Service.</p>
      <h3>Processing details</h3>
      <ul>
        <li><b>Subject matter and purpose:</b> providing and securing project workspaces, client portals, files, messages, approvals, reminders, invoices, support and related functionality.</li>
        <li><b>Nature of processing:</b> collection, storage, organisation, retrieval, transmission, access control, deletion and other operations required by your use of the Service.</li>
        <li><b>People:</b> your personnel, clients, prospects, suppliers, contractors and other workspace participants.</li>
        <li><b>Data:</b> identity and contact details, project communications and files, approval records, invoice metadata, access information and activity history. You decide what Customer Content to submit.</li>
      </ul>
      <h3>Our processor commitments</h3>
      <p>We will process this data only on your documented instructions, including these terms and your use of the Service, unless UK law requires otherwise. We will ensure authorised personnel are bound by confidentiality, maintain appropriate technical and organisational measures, and tell you if we believe an instruction infringes applicable data protection law.</p>
      <p>We will reasonably assist you with data-subject requests, security obligations, breach notifications, impact assessments and regulator consultations, taking account of the nature of processing and the information available to us. We will provide information reasonably needed to demonstrate compliance and permit proportionate audits, subject to confidentiality, security and reasonable advance-notice requirements.</p>
      <h3>Sub-processors and deletion</h3>
      <p>You give general written authorisation for us to use sub-processors to provide hosting, storage, email, payments, support and security. We will require them to protect personal data to a standard consistent with this section and remain responsible for their processing as required by law. We will give reasonable notice of material new sub-processors so you can raise a legitimate data-protection objection.</p>
      <p>At the end of the Service, we will delete or return personal data on request, unless law requires us to retain it. Deletion from backups follows the applicable backup cycle. You remain responsible for the lawfulness of your instructions and for meeting your own controller obligations.</p>
    </>,
  },
  {
    title: "Confidentiality and security",
    content: <>
      <p>Each party may receive non-public information that a reasonable person would understand to be confidential. The receiving party must protect it with reasonable care, use it only for this agreement and disclose it only to people who need it and are bound to protect it.</p>
      <p>Confidential information does not include information that is public without breach, already lawfully known without restriction, independently developed, or lawfully received from someone else. A party may disclose information where law requires it, and will give notice where legally permitted.</p>
      <p>We use reasonable technical and organisational measures designed to protect the Service. No online system is completely secure, so you must use suitable passwords, limit access, protect devices and maintain appropriate backups.</p>
    </>,
  },
  {
    title: "Acceptable use and enforcement",
    content: <>
      <p>You and everyone using your workspace must follow our <a href="/acceptable-use">Acceptable Use Policy</a>. You must not break the law, infringe rights, interfere with security or availability, distribute malware, send spam, or attempt to access data or accounts without permission.</p>
      <p>We may investigate suspected misuse and remove or restrict content or access where reasonably necessary to protect users, the Service or third parties, or to comply with law. We will consider severity, repetition and risk and, where practical, explain the action taken.</p>
    </>,
  },
  {
    title: "Third-party services",
    content: <>
      <p>The Service may connect to or rely on third-party services such as Stripe, email delivery and storage providers. We are responsible for selecting and overseeing our processors as required by law, but third-party products you choose to connect remain governed by their own terms and notices.</p>
      <p>We are not responsible for changes, outages, data handling or acts of an independent third-party service outside our reasonable control. Removing an integration may stop related features from working but does not automatically cancel your ClientFold subscription.</p>
    </>,
  },
  {
    title: "Our intellectual property",
    content: <>
      <p>ClientFold and its licensors own the Service, software, design, documentation, trade marks and related intellectual property. Subject to these terms and payment of applicable fees, we give you a limited, non-exclusive, non-transferable and revocable right to use the Service for your internal business purposes during the agreement.</p>
      <p>You must not copy, sell, sublicense, reverse engineer or create derivative works from the Service except where applicable law expressly allows it. If you give us suggestions or feedback, we may use it without restriction or payment, but we will not identify you publicly without permission.</p>
    </>,
  },
  {
    title: "Suspension and termination",
    content: <>
      <p>You may stop using the Service at any time. We may suspend or terminate access for material breach, non-payment, unlawful use, a credible security risk, or where required by law. Where practical, we will give notice and an opportunity to fix the issue. We may act immediately if delay could cause harm.</p>
      <p>When the agreement ends, your right to use the Service ends. Subject to account status, we may provide a reasonable opportunity to export Customer Content before deletion. We may retain limited records where needed for law, fraud prevention, dispute resolution or enforcement.</p>
      <p>Terms that by their nature should continue—including ownership, confidentiality, accrued payment obligations, disclaimers and liability limits—survive termination.</p>
    </>,
  },
  {
    title: "Warranties and disclaimers",
    content: <>
      <p>We will provide the Service with reasonable care and skill. If we do not, you must tell us and give us a reasonable opportunity to correct the problem.</p>
      <p>Subject to rights that cannot legally be excluded, the Service is provided “as available”. We do not warrant that it will be uninterrupted, completely secure or suitable for every purpose, or that outputs, reminders, invoice status or third-party information will always be complete or error-free. You remain responsible for reviewing important actions and meeting professional, contractual and legal deadlines.</p>
    </>,
  },
  {
    title: "Liability",
    content: <>
      <p>Nothing in these terms limits liability where doing so would be unlawful, including liability for fraud or fraudulent misrepresentation, or death or personal injury caused by negligence.</p>
      <p>Subject to that, neither party is liable for indirect or consequential loss, or loss of profit, revenue, business, goodwill, anticipated savings or data, arising from the Service. Our total aggregate liability arising out of or relating to the Service in any 12-month period will not exceed the fees you paid to us for the Service in the 12 months before the first event giving rise to the claim.</p>
      <p>The exclusions and cap apply to all legal theories and to the fullest extent permitted by law. They reflect the allocation of risk and pricing of the Service. You can reduce risk by maintaining backups, checking important communications and using appropriate access controls.</p>
    </>,
  },
  {
    title: "Changes to these terms",
    content: <>
      <p>We may update these terms to reflect changes to the Service, our business or the law. We will post the revised version with a new date. If a change materially affects your rights or obligations, we will give reasonable advance notice by email, in-product message or another suitable method.</p>
      <p>Material changes normally take effect at your next renewal or on the date stated in the notice. Changes required urgently for law or security may take effect sooner. Continuing to use the Service after the effective date means the updated terms apply; if you do not agree, you should stop using the Service and cancel before then.</p>
    </>,
  },
  {
    title: "General terms and contact",
    content: <>
      <p>Neither party is liable for delay caused by events outside its reasonable control. You may not transfer this agreement without our written consent, except as part of a genuine sale of your business. We may transfer it as part of a reorganisation, financing or sale of our business, provided your rights are not materially reduced.</p>
      <p>If a provision is unenforceable, the rest remains effective. A delay in enforcing a right is not a waiver. This agreement does not create a partnership, agency or employment relationship, and no third party has a right to enforce it. Notices may be sent to the email address associated with your account.</p>
      <p>These terms are governed by the laws of England and Wales, and the courts of England and Wales have exclusive jurisdiction, unless mandatory law requires otherwise.</p>
      <p>Questions and legal notices may be sent to <a href="mailto:legal@useclientfold.com">legal@useclientfold.com</a>.</p>
    </>,
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      activeHref="/terms"
      documentNumber="01"
      title="Terms of Service"
      summary="The agreement for using ClientFold—covering accounts, subscriptions, client work, payments, data protection and the responsibilities we owe each other."
      sections={sections}
    />
  );
}
