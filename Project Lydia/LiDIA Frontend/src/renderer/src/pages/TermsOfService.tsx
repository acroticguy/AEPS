import React from 'react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';

const styles: { [key: string]: CSSProperties } = {
  // Existing styles
  container: {
    fontFamily: 'Arial, sans-serif',
    lineHeight: '1.6',
    color: '#333',
    maxWidth: '800px',
    margin: '40px auto',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    backgroundColor: 'rgba(255, 255, 255, 1)', // Ensure contentWrapper background is solid
    position: 'relative', // Add relative positioning for z-index
    zIndex: 3, // Ensure content is above waves
  },
  title: {
    fontSize: '2.5em',
    color: '#6a1b9a',
    marginBottom: '20px',
    textAlign: 'center',
  },
  heading: {
    fontSize: '1.8em',
    color: '#4a1f74',
    marginTop: '30px',
    marginBottom: '15px',
  },
  subHeading: {
    fontSize: '1.3em',
    color: '#666',
    marginTop: '20px',
    marginBottom: '10px',
  },
  paragraph: {
    marginBottom: '15px',
  },
  list: {
    listStyleType: 'disc',
    marginLeft: '20px',
    marginBottom: '15px',
  },
  listItem: {
    marginBottom: '8px',
  },
  link: {
    display: 'block',
    marginTop: '30px',
    textAlign: 'center',
    color: '#007bff',
    textDecoration: 'none',
    fontSize: '1.1em',
  },
  linkHover: {
    textDecoration: 'underline',
  },
  // New styles for the waves (copied from Login.tsx)
  loginContainerWrapper: { // A wrapper for the entire page to handle waves
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#6a1b9a', // Matches Login.tsx background
  },
  waveBase: {
    position: 'absolute',
    left: '50%',
    width: '200%',
    zIndex: 1,
    borderBottomLeftRadius: '50% 100px',
    borderBottomRightRadius: '50% 100px',
  },
  waveDark: {
    backgroundColor: '#1a0d4a',
    top: '-35%',
    height: '75%',
    transform: 'translateX(-50%) rotate(-4deg)',
    zIndex: 1,
  },
  waveMid: {
    backgroundColor: '#4a1f74',
    top: '-25%',
    height: '70%',
    transform: 'translateX(-50%) rotate(3deg)',
    zIndex: 2,
  },
};

const TermsOfService: React.FC = () => {
  const [isLinkHovered, setIsLinkHovered] = React.useState(false);

  return (
    <div style={styles.loginContainerWrapper}> {/* Use the new wrapper style here */}
      <div style={{ ...styles.waveBase, ...styles.waveDark }}></div>
      <div style={{ ...styles.waveBase, ...styles.waveMid }}></div>

      <div style={styles.container}>
        <h1 style={styles.title}>Terms of Service</h1>
        <p style={styles.paragraph}>
          Welcome to LiDIA! These Terms of Service ("Terms") govern your use of the LiDIA AI assistant service (the "Service"). By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
        </p>

        <h2 style={styles.heading}>1. Description of Service</h2>
        <p style={styles.paragraph}>
          LiDIA is an AI-powered assistant designed to help you manage Microsoft Teams notifications by reading them aloud, summarizing them, and suggesting potential tasks based on their content. The Service aims to enhance your productivity and keep you informed.
        </p>

        <h2 style={styles.heading}>2. User Accounts</h2>
        <h3 style={styles.subHeading}>2.1 Account Creation</h3>
        <p style={styles.paragraph}>
          To use our Service, you must sign in using your Microsoft account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
        </p>
        <h3 style={styles.subHeading}>2.2 Account Security</h3>
        <p style={styles.paragraph}>
          You are responsible for safeguarding the credentials that you use to access the Service and for any activities or actions under your Microsoft account. LiDIA cannot and will not be liable for any loss or damage arising from your failure to comply with the above requirements.
        </p>

        <h2 style={styles.heading}>3. Your Responsibilities</h2>
        <ul style={styles.list}>
          <li style={styles.listItem}>You agree to use the Service only for lawful purposes and in accordance with these Terms.</li>
          <li style={styles.listItem}>You agree not to use the Service in any way that violates any applicable national or international law or regulation.</li>
          <li style={styles.listItem}>You are responsible for all content, including Microsoft Teams notifications, that you process through the Service.</li>
        </ul>

        <h2 style={styles.heading}>4. Intellectual Property</h2>
        <p style={styles.paragraph}>
          The Service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of LiDIA and its licensors. The Service is protected by copyright, trademark, and other laws of both the country of operation and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of LiDIA.
        </p>

        <h2 style={styles.heading}>5. Termination</h2>
        <p style={styles.paragraph}>
          We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
        </p>

        <h2 style={styles.heading}>6. Limitation of Liability</h2>
        <p style={styles.paragraph}>
          In no event shall LiDIA, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose.
        </p>

        <h2 style={styles.heading}>7. Changes to Terms</h2>
        <p style={styles.paragraph}>
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
        </p>
        <p style={styles.paragraph}>
          By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.
        </p>

        <Link
          to="/login"
          style={{
            ...styles.link,
            ...(isLinkHovered && styles.linkHover)
          }}
          onMouseEnter={() => setIsLinkHovered(true)}
          onMouseLeave={() => setIsLinkHovered(false)}
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default TermsOfService;