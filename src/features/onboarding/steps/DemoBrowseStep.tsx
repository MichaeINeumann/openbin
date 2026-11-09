import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { BinPreviewCard } from '@/features/bins/BinPreviewCard';
import { QRCodeDisplay } from '@/features/qrcode/QRCodeDisplay';
import { getContrastBw, resolveColor } from '@/lib/colorPalette';
import { DEMO_BIN } from '../onboardingConstants';

const demoBinPreset = resolveColor(DEMO_BIN.color);
const demoBinBgCss = demoBinPreset?.bgCss;
const demoBinBgHex = demoBinPreset?.bg ?? '#ffffff';
const demoBinTextColor = getContrastBw(demoBinBgHex);
const demoBinColors = { dark: demoBinTextColor, light: demoBinBgHex } as const;
const demoBinContainerStyle = demoBinBgCss ? { background: demoBinBgCss } : undefined;
const demoBinShortCodeStyle = { color: demoBinTextColor } as const;

export function DemoBrowseStep({ onNext }: { onNext: () => void }) {
  const { t: tx } = useTranslation('ui');
  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="text-[22px] font-bold text-[var(--text-primary)] mb-2"> {tx("your_bin_organized_390230", { defaultValue: "Your bin, organized" })} </h2>
      <p className="text-[14px] text-[var(--text-tertiary)] mb-5 leading-relaxed"> {tx("each_bin_gets_a_card_with_its_contents_tags_and_a_qr_code_yo_54722b", { defaultValue: "Each bin gets a card with its contents, tags, and a QR code you can print and stick on the container." })} </p>
      <BinPreviewCard
        name={DEMO_BIN.name}
        color={DEMO_BIN.color}
        icon={DEMO_BIN.icon}
        items={[...DEMO_BIN.items]}
        tags={[...DEMO_BIN.tags]}
        areaName={DEMO_BIN.areaName}
        className="mb-4"
      />
      <div className="rounded-[var(--radius-lg)] p-3 flex flex-col items-center mb-5">
        <QRCodeDisplay
          binId={DEMO_BIN.shortCode}
          size={120}
          shortCode={DEMO_BIN.shortCode}
          colors={demoBinColors}
          containerStyle={demoBinContainerStyle}
          shortCodeStyle={demoBinShortCodeStyle}
        />
      </div>
      <Button
        type="button"
        onClick={onNext}
        className="w-full rounded-[var(--radius-md)] h-11 text-[15px]"
      > {tx("finish_tour_b2903b", { defaultValue: "Finish Tour" })} </Button>
    </div>
  );
}
