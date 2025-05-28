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

const PrivacyPolicy: React.FC = () => {
  const [isLinkHovered, setIsLinkHovered] = React.useState(false);

  return (
    <div style={styles.loginContainerWrapper}> {/* Use the new wrapper style here */}
      <div style={{ ...styles.waveBase, ...styles.waveDark }}></div>
      <div style={{ ...styles.waveBase, ...styles.waveMid }}></div>

      <div style={styles.container}>
        <h1 style={styles.title}>Privacy Policy</h1>
        <p style={styles.paragraph}>
          Your privacy is important to us. This Privacy Policy explains how LiDIA collects, uses, and discloses information about you when you use our AI assistant service.
        </p>

        <h2 style={styles.heading}>1. Information We Collect</h2>
        <h3 style={styles.subHeading}>1.1 Personal Information</h3>
        <p style={styles.paragraph}>
          When you sign in with your Microsoft account, we collect basic profile information such as your user ID, display name, and email address, as provided by Microsoft. We do not collect your Microsoft account password.
        </p>
        <h3 style={styles.subHeading}>1.2 Usage Data</h3>
        <p style={styles.paragraph}>
          We may collect information on how the Service is accessed and used ("Usage Data"). This Usage Data may include information such as your computer's Internet Protocol address (e.g., IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers and other diagnostic data.
        </p>
        <h3 style={styles.subHeading}>1.3 Microsoft Teams Data</h3>
        <p style={styles.paragraph}>
          To provide the core functionality of LiDIA, we access your Microsoft Teams notifications. We process the content of these notifications to read them aloud and suggest tasks. We do not store the full content of your private messages or conversations on our servers permanently. Task suggestions derived from these notifications may be stored to enable task management features.
        </p>

        <h2 style={styles.heading}>2. How We Use Information</h2>
        <p style={styles.paragraph}>We use the collected data for various purposes:</p>
        <ul style={styles.list}>
          <li style={styles.listItem}>To provide and maintain our Service.</li>
          <li style={styles.listItem}>To notify you about changes to our Service.</li>
          <li style={styles.listItem}>To allow you to participate in interactive features of our Service when you choose to do so.</li>
          <li style={styles.listItem}>To provide customer support.</li>
          <li style={styles.listItem}>To gather analysis or valuable information so that we can improve our Service.</li>
          <li style={styles.listItem}>To monitor the usage of our Service.</li>
          <li style={styles.listItem}>To detect, prevent and address technical issues.</li>
          <li style={styles.listItem}>To process your questionnaire responses to personalize your AI assistant experience.</li>
        </ul>

        <h2 style={styles.heading}>3. Disclosure of Data</h2>
        <p style={styles.paragraph}>
          We may disclose your Personal Information in the good faith belief that such action is necessary to:
        </p>
        <ul style={styles.list}>
          <li style={styles.listItem}>Comply with a legal obligation.</li>
          <li style={styles.listItem}>Protect and defend the rights or property of LiDIA.</li>
          <li style={styles.listItem}>Prevent or investigate possible wrongdoing in connection with the Service.</li>
          <li style={styles.listItem}>Protect the personal safety of users of the Service or the public.</li>
          <li style={styles.listItem}>Protect against legal liability.</li>
        </ul>

        <h2 style={styles.heading}>4. Security of Data</h2>
        <p style={styles.paragraph}>
          The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Information, we cannot guarantee its absolute security.
        </p>

        <h2 style={styles.heading}>5. Your Data Protection Rights</h2>
        <p style={styles.paragraph}>
          Depending on your location, you may have the following data protection rights:
        </p>
        <ul style={styles.list}>
          <li style={styles.listItem}>The right to access, update or to delete the information we have on you.</li>
          <li style={styles.listItem}>The right of rectification.</li>
          <li style={styles.listItem}>The right to object.</li>
          <li style={styles.listItem}>The right of restriction.</li>
          <li style={styles.listItem}>The right to data portability.</li>
          <li style={styles.listItem}>The right to withdraw consent.</li>
        </ul>
        <p style={styles.paragraph}>
          Please note that we may ask you to verify your identity before responding to such requests.
        </p>

        <h2 style={styles.heading}>6. Changes to This Privacy Policy</h2>
        <p style={styles.paragraph}>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. We will let you know via email and/or a prominent notice on our Service, prior to the change becoming effective and update the "effective date" at the top of this Privacy Policy.
        </p>
        <p style={styles.paragraph}>
          You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
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

export default PrivacyPolicy;