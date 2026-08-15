import type { ExperienceItem } from '../types';

export const experienceData: ExperienceItem[] = [
  {
    id: 'highschool',
    type: 'education', 
    duration: '2016 - 2022',
    title: '初中 / 高中',
    location: '吉林师范大学附属中学 / 四平市第一高级中学',
    details: [ // Use an array for details
      '吉林师范大学附属中学', 
      '四平市第一高级中学'
    ],
    alignment: 'right', // 时间轴样式对齐
    // 高中时期相册
    galleryImages: [
      { src: 'https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/images/exp/edu/gz1.jpg?imageMogr2/quality/50/format/webp' },
      { src: 'https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/images/exp/edu/gz2.jpg?imageMogr2/quality/50/format/webp' },
      { src: 'https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/images/exp/edu/gz3.jpg?imageMogr2/quality/50/format/webp' },
      { src: 'https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/images/exp/edu/gz4.jpg?imageMogr2/quality/50/format/webp' },
      { src: 'https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/images/exp/edu/gz5.jpg?imageMogr2/quality/50/format/webp' },
      { src: 'https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/images/exp/edu/gz6.jpg?imageMogr2/quality/50/format/webp' },
      { src: 'https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/images/exp/edu/gz7.jpg?imageMogr2/quality/50/format/webp', caption: '张信哲居然在这里开演唱会，还是我家楼下！' },

    ]
  },
  {
    id: 'university',
    type: 'education',
    duration: '2022 - 至今',
    title: '大学',
    location: '西安外国语大学',
    details: [
        '西安外国语大学',
        '英语系'
    ],
    alignment: 'left',
    galleryImages: [ // 大学时期相册
      { src: 'https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/images/exp/xisu/XS1.jpg?imageMogr2/quality/50/format/webp', caption: '油头垢面的我' },
      { src: 'https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/images/exp/xisu/XS2.jpg?imageMogr2/quality/50/format/webp' },
      { src: 'https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/images/exp/xisu/XS3.jpg?imageMogr2/quality/50/format/webp' },
      { src: 'https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/images/exp/xisu/XS4.jpg?imageMogr2/quality/50/format/webp' },
      { src: 'https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/images/exp/xisu/XS5.jpg?imageMogr2/quality/50/format/webp' },
      { src: 'https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/images/exp/xisu/XS6.jpg?imageMogr2/quality/50/format/webp' },
      { src: 'https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/images/exp/xisu/XS7.jpg?imageMogr2/quality/50/format/webp' },
      { src: 'https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/images/exp/xisu/XS8.jpg?imageMogr2/quality/50/format/webp' },
      { src: 'https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/images/exp/xisu/XS9.jpg?imageMogr2/quality/50/format/webp' },
      { src: 'https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/images/exp/xisu/XS10.jpg?imageMogr2/quality/50/format/webp' },
      { src: 'https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/images/exp/xisu/XS11.png?imageMogr2/quality/50/format/webp' }, // png extension
      { src: 'https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/images/exp/xisu/XS12.jpg?imageMogr2/quality/50/format/webp' },
      { src: 'https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/images/exp/xisu/XS13.jpg?imageMogr2/quality/50/format/webp' },
      { src: 'https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/images/exp/xisu/XS14.jpg?imageMogr2/quality/50/format/webp' },
      { src: 'https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/images/exp/xisu/XS15.jpg?imageMogr2/quality/50/format/webp' },
      { src: 'https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/images/exp/xisu/XS16.jpg?imageMogr2/quality/50/format/webp' }
    ]
  },
  {
    id: 'internship',
    type: 'work',
    duration: '2024.07.15 - 08.16',
    title: '实习',
    location: '吉林泰斯特生物电子工程有限公司',
    details: [
      '吉林泰斯特生物电子工程有限公司',
      '国内销售部',
      '产品翻译、校对 | 市场调研'
    ],
    alignment: 'left',
    galleryImages: [ // 实习相册
      { src: 'https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/images/exp/shixi/SX1.jpg?imageMogr2/quality/50/format/webp' },
      { src: 'https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/images/exp/shixi/SX2.jpg?imageMogr2/quality/50/format/webp', caption: '猛干五千管' },
      { src: 'https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/images/exp/shixi/SX3.jpg?imageMogr2/quality/50/format/webp', caption: '然姐请我吃肯德基' },
      { src: 'https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/images/exp/shixi/SX4.jpg?imageMogr2/quality/50/format/webp' },
      { src: 'https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/images/exp/shixi/SX5.jpg?imageMogr2/quality/50/format/webp', caption: '公司周年庆' },
      { src: 'https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/images/exp/shixi/SX6.jpg?imageMogr2/quality/50/format/webp' },
    ]
  },
  {
    id: 'volunteer',
    type: 'volunteer',
    duration: '2024.11.11 - 11.17',
    title: '志愿者',
    location: '2024 中国整合肿瘤学大会',
    details: [
       '2024 中国整合肿瘤学大会',
       '试片区小组长'
    ],
    alignment: 'left',
    galleryImages: [
      { src: 'https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/images/exp/zhiyuan/zhiyuan1.jpg?imageMogr2/quality/50/format/webp' }, 
      { src: 'https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/images/exp/zhiyuan/zhiyuan2.jpg?imageMogr2/quality/50/format/webp' },
      { src: 'https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/images/exp/zhiyuan/zhiyuan3.jpg?imageMogr2/quality/50/format/webp', caption: '请大家喝橙汁' },
      { src: 'https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/images/exp/zhiyuan/zhiyuan4.jpg?imageMogr2/quality/50/format/webp', caption: '薅来的柳叶刀杂志' },
      { src: 'https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/images/exp/zhiyuan/zhiyuan5.jpg?imageMogr2/quality/50/format/webp' }, 
      { src: 'https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/images/exp/zhiyuan/zhiyuan6.jpg?imageMogr2/quality/50/format/webp' },
      { src: 'https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/images/exp/zhiyuan/zhiyuan7.jpg?imageMogr2/quality/50/format/webp' },
      { src: 'https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/images/exp/zhiyuan/zhiyuan8.jpg?imageMogr2/quality/50/format/webp' },
      { src: 'https://rainmorime-1315830626.cos.ap-beijing.myqcloud.com/images/exp/zhiyuan/zhiyuan9.jpg?imageMogr2/quality/50/format/webp' }
    ]
  },
];
