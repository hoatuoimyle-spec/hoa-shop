import Snowfall from '@/components/Snowfall';
import ChristmasHero from '@/components/ChristmasHero';
import ChristmasCategories from '@/components/ChristmasCategories';
import ChristmasCollection from '@/components/ChristmasCollection';
import GiftArea from '@/components/GiftArea';

export default function HomePage() {
  return (
    <>
      {/* Snowfall toàn trang: zIndex 0, nằm dưới tất cả nội dung */}
      <Snowfall />
      <ChristmasHero />
      <ChristmasCategories />
      <ChristmasCollection />
      <GiftArea />
    </>
  );
}
