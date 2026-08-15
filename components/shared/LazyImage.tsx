import React, { useState, useEffect, useRef } from 'react';
import styles from '../../styles/LazyImage.module.scss';

const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  thumbnailSrc = null, 
  onLoad = null,
  enableWebP = true,
  quality = 'medium' // low, medium, high
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(thumbnailSrc || null);
  const imgRef = useRef(null);

  // 根据质量设置生成腾讯云COS的图片处理参数
  const getProcessedImageUrl = (originalUrl, quality = 'medium') => {
    if (!originalUrl || !originalUrl.includes('rainmorime-1315830626.cos.ap-beijing.myqcloud.com')) {
      return originalUrl;
    }

    const qualityParams = {
      low: 'imageMogr2/quality/60/format/webp',
      medium: 'imageMogr2/quality/80/format/webp', 
      high: 'imageMogr2/quality/90/format/webp'
    };

    const param = enableWebP ? qualityParams[quality] : `imageMogr2/quality/${quality === 'low' ? 60 : quality === 'medium' ? 80 : 90}`;
    return `${originalUrl}?${param}`;
  };

  // 生成缩略图URL
  const getThumbnailUrl = (originalUrl) => {
    if (!originalUrl || !originalUrl.includes('rainmorime-1315830626.cos.ap-beijing.myqcloud.com')) {
      return originalUrl;
    }
    // 生成小尺寸缩略图用于首次加载
    return `${originalUrl}?imageMogr2/thumbnail/400x300/quality/50/format/webp`;
  };

  // Intersection Observer 用于检测图片是否进入视窗
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // 当图片进入视窗时开始渐进式加载
  useEffect(() => {
    if (!isInView) return;

    const loadImage = async () => {
      // 如果没有提供缩略图，先加载低质量版本
      if (!thumbnailSrc) {
        const thumbnailUrl = getThumbnailUrl(src);
        setCurrentSrc(thumbnailUrl);
        
        // 预加载缩略图
        const thumbnailImg = new Image();
        await new Promise((resolve) => {
          thumbnailImg.onload = resolve;
          thumbnailImg.src = thumbnailUrl;
        });
      }

      // 然后加载高质量版本
      const highQualityUrl = getProcessedImageUrl(src, quality);
      const highQualityImg = new Image();
      
      highQualityImg.onload = () => {
        setCurrentSrc(highQualityUrl);
        setIsLoaded(true);
        if (onLoad) onLoad();
      };
      
      highQualityImg.src = highQualityUrl;
    };

    loadImage();
  }, [isInView, src, quality, thumbnailSrc, enableWebP, onLoad]);

  return (
    <div ref={imgRef} className={`${styles.lazyImageContainer} ${className}`}>
      {currentSrc ? (
        <img
          src={currentSrc}
          alt={alt}
          className={`${styles.lazyImage} ${isLoaded ? styles.loaded : styles.loading}`}
          loading="lazy"
        />
      ) : (
        <div className={styles.placeholder}>
          <div className={styles.spinner}></div>
        </div>
      )}
    </div>
  );
};

export default LazyImage; 