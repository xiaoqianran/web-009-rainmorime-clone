import styles from '../../styles/Home.module.scss';
import Noise from '../effects/Noise';

export default function AboutSection({
  aboutSectionRef,
  aboutContentRef,
  runtime,
  totalVisits,
  currentVisitors,
}) {
  return (
    <div id="about-section" ref={aboutSectionRef} className={`${styles.contentSection} ${styles.aboutSection}`}>
      <Noise />
      <div ref={aboutContentRef} className={styles.aboutContentInner}>
        <h2>ABOUT</h2>
        <div className={styles.siteStatsContainer}>
          <p>系统运行时长: {runtime}</p>
          <p>累计访问量: {totalVisits}</p>
          <p>当前在线用户: {currentVisitors}</p>
        </div>
        <div className={styles.footerInfo}>
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className={styles.licenseLink}>
            陕ICP备2023011267号-1
          </a>
          <a href="https://icp.gov.moe/?keyword=20265003" target="_blank" rel="noopener noreferrer" className={styles.licenseLink}>
            萌ICP备20265003号
          </a>
        </div>
        <div className={styles.footerInfo}>
          <a
            href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.licenseLink}
          >
            CC BY-NC-SA 4.0
          </a> 2025-PRESENT © RainMorime
        </div>
        <div className={styles.aboutImageContainer}>
          <img
            src="https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/pictures/www.rainmorime.com.png?imageMogr2/quality/50/format/webp"
            alt="Website QR Code"
            className={styles.aboutImage}
          />
        </div>
      </div>
      <div className={styles.aboutNewImageWrapper}>
        <div className={styles.aboutNewImageContainer}>
          <img
            src="https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/images/Test/25015%E7%81%B02.png?imageMogr2/quality/50/format/webp"
            alt="About decorative grey"
            className={`${styles.aboutNewImageBase} ${styles.aboutNewImageNormal}`}
          />
          <img
            src="https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/images/Test/25015%E7%B4%AB2.png?imageMogr2/quality/50/format/webp"
            alt="About decorative purple"
            className={`${styles.aboutNewImageBase} ${styles.aboutNewImageInverted}`}
          />
        </div>
      </div>
    </div>
  );
}
