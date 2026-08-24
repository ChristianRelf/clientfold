import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Privacy Notice",
  description: "How ClientFold collects, uses and protects personal information.",
  alternates: { canonical: "/privacy" },
};

const sections: LegalSection[] = [
  {
    title: "Who we are and when this applies",
    content: <>
      <p>ClientFold is a UK-based client-workspace service. The ClientFold operator identified on your checkout page, order form or subscription receipt is the controller of personal information used to run our website, accounts, subscriptions, support and direct communications. In this notice, <b>ClientFold</b>, <b>we</b>, <b>us</b> and <b>our</b> refer to that operator.</p>
      <p>This notice applies to website visitors, account holders, organisation members, people who join our waitlist, and clients or other people invited into a ClientFold portal. Contact us at <a href="mailto:privacy@useclientfold.com">privacy@useclientfold.com</a>.</p>
      <p>When a customer uses ClientFold for its own client work, that customer usually decides why and how information in its workspace is used. The customer is the controller and ClientFold acts as its processor. Section 5 explains this distinction.</p>
    </>,
  },
  {
    title: "How we receive information",
    content: <>
      <p>We receive personal information:</p>
      <ul>
        <li><b>Directly from you</b> when you register, join the waitlist, enter a portal, contact support, configure a workspace or submit content.</li>
        <li><b>From a ClientFold customer</b> when it adds you as a team member, client or contact, sends an invitation, assigns work or uploads information about a project.</li>
        <li><b>Automatically</b> from your browser or device when you use the website or Service, including session, security, activity and—where permitted—campaign information.</li>
        <li><b>From service providers</b>, such as payment status and transaction references from Stripe or delivery information from our email provider.</li>
      </ul>
      <p>If you give us information about another person, you should have authority to do so and provide any notice required by law.</p>
    </>,
  },
  {
    title: "Information we collect",
    content: <>
      <ul>
        <li><b>Account and profile data:</b> name, email address, password hash, avatar, role and account-verification information.</li>
        <li><b>Organisation data:</b> business name, website, branding, team membership, billing contact, currency, time zone and plan settings.</li>
        <li><b>Client and workspace data:</b> client names and contact details, projects, tasks, messages, files, comments, approvals, reminders, invoices, payment status and activity history.</li>
        <li><b>Marketplace import data:</b> project or order identifiers, buyer handles and names, dates, status, milestone metadata, marketplace links and earnings supplied through a reviewed CSV, manual entry or a forwarded notification. We do not retain the raw forwarded email body or attachments after normalization.</li>
        <li><b>Billing data:</b> plan, subscription status, customer and transaction references, invoice details and connected-account status. Payment-card details are entered with Stripe and are not stored by ClientFold.</li>
        <li><b>Technical and security data:</b> session identifiers, browser and device information, timestamps, request metadata, audit records and network information used to operate and protect the Service.</li>
        <li><b>Website and campaign data:</b> pages viewed, actions taken, referral source, campaign parameters and first-party attribution identifiers where analytics consent is given.</li>
        <li><b>Communications:</b> support requests, feedback and other correspondence you send to us.</li>
      </ul>
      <p>We do not intentionally ask customers to store special-category or criminal-offence data. Customers should submit sensitive information only where necessary, lawful and appropriately protected.</p>
    </>,
  },
  {
    title: "Purposes and lawful bases",
    content: <>
      <p>We use personal information for the purposes and lawful bases below. More than one basis may apply depending on the context.</p>
      <div className="overflow-x-auto">
        <table>
          <thead><tr><th>What we do</th><th>Information used</th><th>Lawful basis</th></tr></thead>
          <tbody>
            <tr><td>Create accounts and provide the Service</td><td>Account, organisation, workspace and technical data</td><td>Contract; legitimate interests in delivering the Service to customer users and invited clients</td></tr>
            <tr><td>Manage subscriptions and payments</td><td>Account, billing and transaction data</td><td>Contract; legal obligation for financial records</td></tr>
            <tr><td>Secure the Service and prevent fraud or misuse</td><td>Account, technical, security and activity data</td><td>Legitimate interests in protecting users, ClientFold and the public; legal obligation where applicable</td></tr>
            <tr><td>Send operational messages and support users</td><td>Contact, workspace and communications data</td><td>Contract; legitimate interests in supporting and administering the Service</td></tr>
            <tr><td>Improve reliability, usability and performance</td><td>Technical data, product events, feedback and aggregated usage</td><td>Legitimate interests in improving the Service; consent where non-essential storage or access is involved</td></tr>
            <tr><td>Measure website campaigns</td><td>Website, referral and campaign data</td><td>Consent</td></tr>
            <tr><td>Comply with law and resolve disputes</td><td>Relevant account, billing, security, workspace and communications data</td><td>Legal obligation; legitimate interests in establishing, exercising or defending legal claims</td></tr>
          </tbody>
        </table>
      </div>
      <p>Our legitimate interests include operating a useful and secure business service, understanding performance, preventing abuse and protecting legal rights. We consider necessity, proportionality and the effect on individuals before relying on this basis.</p>
      <p>We do not sell personal information, use confidential workspace content for third-party advertising, or make eligibility or other legally significant decisions about you using solely automated processing.</p>
    </>,
  },
  {
    title: "Customer workspaces and our processor role",
    content: <>
      <p>A business using ClientFold normally controls the personal information it places in its workspace, including client contacts, project files, messages, approvals and invoice records. ClientFold processes that information on the business’s documented instructions to provide and secure the Service.</p>
      <p>If you were invited into a customer workspace, direct requests about that workspace information to the business that invited you. It can explain its own purposes and lawful bases. We will support the business in responding and may refer your request to it.</p>
      <p>We act as a controller for limited related purposes of our own, such as account security, service billing, fraud prevention, compliance and direct support communications. The data processing terms in our <a href="/terms">Terms of Service</a> govern our processor activities.</p>
    </>,
  },
  {
    title: "Who receives information",
    content: <>
      <p>We disclose personal information only where needed to provide the Service, follow your instructions or meet legal obligations. Recipients may include:</p>
      <ul>
        <li>authorised members of your organisation and the client users or collaborators with whom a workspace item is shared;</li>
        <li>providers of hosting, database infrastructure, object storage, transactional email, support, monitoring and security;</li>
        <li>Stripe for subscription billing, connected accounts and client-invoice payments;</li>
        <li>professional advisers, auditors and insurers who are bound by confidentiality;</li>
        <li>a buyer, investor or successor involved in a genuine financing, reorganisation or sale, subject to appropriate confidentiality; and</li>
        <li>courts, regulators, law enforcement or other authorities where disclosure is required or legally permitted.</li>
      </ul>
      <p>Configured providers may include Stripe for payments, Resend for transactional email, and an S3-compatible provider for file storage. Providers may access only the information needed for their service and are required to protect it under contract where applicable.</p>
    </>,
  },
  {
    title: "International transfers",
    content: <>
      <p>Some recipients may process personal information outside the United Kingdom. Before making a restricted transfer, we use a lawful transfer mechanism appropriate to the destination and recipient. This may include UK adequacy regulations, the UK International Data Transfer Agreement, the UK Addendum to the EU Standard Contractual Clauses, or another safeguard permitted by data protection law.</p>
      <p>Where required, we assess whether the safeguard provides practical protection and use supplementary measures. Contact <a href="mailto:privacy@useclientfold.com">privacy@useclientfold.com</a> for more information about the safeguards relevant to your information.</p>
    </>,
  },
  {
    title: "How long we keep information",
    content: <>
      <p>We keep personal information only for as long as reasonably needed for the purpose collected. We consider account status, customer instructions, sensitivity, security and recovery needs, limitation periods and legal record-keeping requirements.</p>
      <ul>
        <li><b>Account and workspace data</b> is generally kept while the relevant account is active and for a limited period afterwards to allow retrieval, resolve disputes and complete deletion.</li>
        <li><b>Financial and subscription records</b> may be kept for the period required by tax, accounting and anti-fraud obligations.</li>
        <li><b>Security and audit records</b> are kept for a proportionate period based on the risk they help us investigate.</li>
        <li><b>Consent and preference records</b> are kept long enough to demonstrate and respect the choice made.</li>
        <li><b>Support communications</b> are kept while needed to resolve the request and identify recurring issues.</li>
      </ul>
      <p>A customer controlling a workspace may set or request a different period. When information is no longer needed, we delete or anonymise it. Residual copies are removed through the applicable backup cycle unless law requires preservation.</p>
    </>,
  },
  {
    title: "Security",
    content: <>
      <p>We use technical and organisational measures designed for the nature and risk of the information we handle. These include signed and time-limited sessions, role and tenant access controls, restricted file links, encryption in transit, audit records, provider access controls and procedures for responding to incidents.</p>
      <p>Access is limited to authorised people and providers who need it. We review safeguards as the Service changes. No system can guarantee absolute security, so use a strong unique password, protect invitation links and tell us promptly at <a href="mailto:security@useclientfold.com">security@useclientfold.com</a> if you believe an account or workspace has been compromised.</p>
    </>,
  },
  {
    title: "Cookies, analytics and communications",
    content: <>
      <p>Essential cookies keep sign-in, portal access and privacy choices working. Non-essential analytics or advertising measurement remains off until the relevant consent is given. See the <a href="/cookies">Cookie Notice</a> or use Cookie settings in the footer to change your choice at any time.</p>
      <p>We send operational email where needed for the Service—for example invitations, approvals, reminders, billing and security messages. These are not promotional messages. If we send optional marketing, you can unsubscribe using the link in the message or contact us. We may still send essential service communications.</p>
    </>,
  },
  {
    title: "Automated processing",
    content: <>
      <p>ClientFold can automatically schedule or send reminders based on workspace settings and project activity. These functions support routine workflow and do not make decisions that produce legal or similarly significant effects about an individual.</p>
      <p>We do not use solely automated decision-making or profiling to decide whether you may have an account, determine contractual terms, or make other legally significant decisions about you. If this changes, we will update this notice and provide the information and safeguards required by law.</p>
    </>,
  },
  {
    title: "Your data protection rights",
    content: <>
      <p>Depending on the information, circumstances and lawful basis, you may have the right to:</p>
      <ul>
        <li>ask for access to personal information and a copy of it;</li>
        <li>correct inaccurate or incomplete information;</li>
        <li>ask us to erase information or restrict how it is used;</li>
        <li>receive information you provided in a portable format where the right applies;</li>
        <li>withdraw consent at any time, without affecting earlier lawful processing; and</li>
        <li>object to certain uses of your information.</li>
      </ul>
      <aside className="legal-callout"><b>Your right to object.</b> You may object at any time to direct marketing. You may also object to processing based on legitimate interests because of your particular situation. We will stop unless we have compelling legitimate grounds to continue or need the information for legal claims.</aside>
      <p>Rights are not absolute and may apply differently depending on our role and lawful basis. Email <a href="mailto:privacy@useclientfold.com">privacy@useclientfold.com</a> to make a request. We may ask for information needed to verify your identity and will respond within the period required by law. There is normally no fee, but the law permits one in limited circumstances.</p>
    </>,
  },
  {
    title: "Complaints",
    content: <>
      <p>Please contact us first if you have a privacy concern so we can try to resolve it. You also have the right to complain to the UK Information Commissioner’s Office (ICO).</p>
      <p>Information about making a complaint is available at <a href="https://ico.org.uk/make-a-complaint/" rel="noreferrer">ico.org.uk/make-a-complaint</a>. If you live outside the UK, you may also have the right to contact your local data protection authority.</p>
    </>,
  },
  {
    title: "Children, changes and contact",
    content: <>
      <p>ClientFold is a business service and is not directed to children. We do not knowingly create accounts for people under 18. If you believe a child’s information has been submitted improperly, contact us so we can investigate.</p>
      <p>We may update this notice when the Service, our providers or the law changes. We will publish the current version here and change the date above. We will highlight material changes by email or in the Service where appropriate.</p>
      <p>Questions, requests and requests for transfer-safeguard information may be sent to <a href="mailto:privacy@useclientfold.com">privacy@useclientfold.com</a>. Security concerns may be sent to <a href="mailto:security@useclientfold.com">security@useclientfold.com</a>.</p>
    </>,
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      activeHref="/privacy"
      documentNumber="02"
      title="Privacy Notice"
      summary="How ClientFold handles personal information across our website, accounts and customer workspaces—and the choices and rights available to you."
      contactEmail="privacy@useclientfold.com"
      sections={sections}
    />
  );
}
