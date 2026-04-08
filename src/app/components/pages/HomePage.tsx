import { HeroSection } from "../HeroSection";
import { StatsSection } from "../StatsSection";
import { CenterTypesSection } from "../CenterTypesSection";
import { PortalsSection } from "../PortalsSection";
import { PainSolutionSection } from "../PainSolutionSection";
import { ProcessFlowSection } from "../ProcessFlowSection";
import { FeaturesSection } from "../FeaturesSection";
import { DemoAccessSection } from "../DemoAccessSection";
import { useDocumentTitle } from "../../utils/hooks";

export function HomePage() {
  useDocumentTitle("GDNN·GDTX — Hệ thống Quản lý Trung tâm Đào tạo Ngoại ngữ & Tin học");

  return (
    <>
      {/* 1. Hero — Dark, dramatic, all center types */}
      <HeroSection />

      {/* 2. Stats — Animated counters, dark seamless bg */}
      <StatsSection />

      {/* 3. Center Types — 4 loại hình TT với cards chi tiết */}
      <CenterTypesSection />

      {/* 4. Portals — Tabbed: 4 phân hệ với preview */}
      <PortalsSection />

      {/* 5. Pain vs Solution — Before/After */}
      <PainSolutionSection />

      {/* 6. Process Flow — Quy trình phê duyệt điện tử */}
      <ProcessFlowSection />

      {/* 7. Features — 8 tính năng cốt lõi */}
      <FeaturesSection />

      {/* 8. Demo Access — Dark, click-to-login */}
      <DemoAccessSection />
    </>
  );
}
