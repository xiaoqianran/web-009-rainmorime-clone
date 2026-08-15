import styles from '../../styles/Home.module.scss';

export default function SectionPageLayout({ children }) {
  return (
    <div className={styles.contentWrapper}>
      {children}
    </div>
  );
}
