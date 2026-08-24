import * as React from "react";
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "react-email";

export type WaitlistVerificationEmailProps = {
  name: string;
  verificationUrl: string;
  year: number;
};

export function WaitlistVerificationEmail({ name, verificationUrl, year }: WaitlistVerificationEmailProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Confirm your ClientFold early-access request.</Preview>
      <Body style={body}>
        <Container style={shell}>
          <Section style={card}>
            <Section style={header}>
              <Row>
                <Column>
                  <Text style={wordmark}>ClientFold</Text>
                </Column>
                <Column align="right">
                  <Text style={foldMark}>↗</Text>
                </Column>
              </Row>
            </Section>

            <Section style={content}>
              <Text style={eyebrow}>Private beta · One last step</Text>
              <Heading as="h1" style={heading}>Confirm your place on the waitlist.</Heading>
              <Text style={greeting}>Hi {name},</Text>
              <Text style={copy}>
                One quick step and your ClientFold early-access request is confirmed. We’ll only send useful product and access updates.
              </Text>
              <Button href={verificationUrl} style={button}>Confirm my email&nbsp;&nbsp;→</Button>
              <Hr style={divider} />
              <Text style={securityNote}>
                This secure link expires in 24 hours. If you did not request early access, you can safely ignore this email.
              </Text>
            </Section>

            <Section style={brandFooter}>
              <Text style={footerTitle}>Client work. Without the chase.</Text>
              <Text style={footerCopy}>Approvals, files, invoices and thoughtful follow-ups in one calm place.</Text>
            </Section>
          </Section>
          <Text style={legal}>© {year} ClientFold · useclientfold.com</Text>
        </Container>
      </Body>
    </Html>
  );
}

const body: React.CSSProperties = {
  margin: 0,
  backgroundColor: "#efeee8",
  color: "#292b26",
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const shell: React.CSSProperties = {
  margin: "0 auto",
  maxWidth: "600px",
  padding: "32px 16px",
};

const card: React.CSSProperties = {
  overflow: "hidden",
  backgroundColor: "#f8f7f2",
  border: "1px solid #d5d4cd",
};

const header: React.CSSProperties = {
  padding: "20px 28px",
  borderBottom: "1px solid #dfded7",
};

const wordmark: React.CSSProperties = {
  margin: 0,
  color: "#292b26",
  fontSize: "18px",
  fontWeight: 650,
  letterSpacing: "-0.5px",
};

const foldMark: React.CSSProperties = {
  boxSizing: "border-box",
  display: "inline-block",
  width: "30px",
  height: "30px",
  margin: 0,
  backgroundColor: "#e8ede4",
  border: "1px solid #aeb5a9",
  color: "#5f6f59",
  fontSize: "15px",
  lineHeight: "28px",
  textAlign: "center",
};

const content: React.CSSProperties = {
  padding: "40px 28px 36px",
};

const eyebrow: React.CSSProperties = {
  margin: "0 0 18px",
  color: "#667060",
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "1.7px",
  lineHeight: "16px",
  textTransform: "uppercase",
};

const heading: React.CSSProperties = {
  maxWidth: "460px",
  margin: 0,
  color: "#292b26",
  fontSize: "34px",
  fontWeight: 600,
  letterSpacing: "-1.4px",
  lineHeight: "1.08",
};

const greeting: React.CSSProperties = {
  margin: "24px 0 0",
  color: "#656a61",
  fontSize: "15px",
  lineHeight: "25px",
};

const copy: React.CSSProperties = {
  maxWidth: "470px",
  margin: "8px 0 0",
  color: "#656a61",
  fontSize: "15px",
  lineHeight: "25px",
};

const button: React.CSSProperties = {
  marginTop: "28px",
  padding: "14px 22px",
  backgroundColor: "#2d302a",
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: 650,
  lineHeight: "18px",
  textDecoration: "none",
};

const divider: React.CSSProperties = {
  margin: "30px 0 20px",
  borderColor: "#dfded7",
};

const securityNote: React.CSSProperties = {
  margin: 0,
  color: "#8a8c83",
  fontSize: "11px",
  lineHeight: "18px",
};

const brandFooter: React.CSSProperties = {
  padding: "20px 28px",
  backgroundColor: "#282b24",
};

const footerTitle: React.CSSProperties = {
  margin: 0,
  color: "#f3f2ed",
  fontSize: "12px",
  fontWeight: 600,
  lineHeight: "18px",
};

const footerCopy: React.CSSProperties = {
  margin: "5px 0 0",
  color: "#aeb3a9",
  fontSize: "10px",
  lineHeight: "15px",
};

const legal: React.CSSProperties = {
  margin: "16px 0 0",
  color: "#8a8c83",
  fontSize: "10px",
  lineHeight: "15px",
  textAlign: "center",
};

WaitlistVerificationEmail.PreviewProps = {
  name: "Sam Rivera",
  verificationUrl: "https://useclientfold.com/waitlist/verify?token=preview-token",
  year: new Date().getUTCFullYear(),
} satisfies WaitlistVerificationEmailProps;

export default WaitlistVerificationEmail;
