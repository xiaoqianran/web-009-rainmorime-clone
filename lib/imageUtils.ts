export const ImageManager = {
  getProcessedUrl(url: string, quality = "medium"): string {
    if (!url) return url;
    if (!url.includes("rainmorime-1315830626.cos.ap-beijing.myqcloud.com")) return url;
    if (url.includes("imageMogr2")) return url;
    const q = quality === "low" ? 60 : quality === "high" ? 90 : 80;
    return url + "?imageMogr2/quality/" + q + "/format/webp";
  },
  getThumbnailUrl(url: string): string {
    if (!url) return url;
    if (!url.includes("rainmorime-1315830626.cos.ap-beijing.myqcloud.com")) return url;
    return url.split("?")[0] + "?imageMogr2/thumbnail/400x300/quality/50/format/webp";
  },
};

export default ImageManager;
