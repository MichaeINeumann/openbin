import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useScanHistory } from '@/features/dashboard/scanHistory';
import { BinUsageSection } from '@/features/usage/BinUsageSection';
import { resolveColor } from '@/lib/colorPalette';
import { resolveIcon } from '@/lib/iconMap';
import { generateQRDataURL } from '@/lib/qr';
import { relativeTime, sectionHeader, sectionHeaderRow } from '@/lib/utils';
import type { Bin } from '@/types';
import { BinDetailActivitySection } from './BinDetailActivitySection';

interface BinDetailInformationTabProps {
  bin: Bin;
}

const QR_FG = '#000';
const QR_BG_FALLBACK = '#fff';
// Render QR at a high resolution and let CSS downscale; keeps dots crisp and
// makes the library's integer-rounding leftover (proportional margin) negligible.
const QR_GEN_SIZE = 540;

export function BinDetailInformationTab({ bin }: BinDetailInformationTabProps) {
  const { i18n: { language: uiLanguage } } = useTranslation();
  const { t: tx } = useTranslation('ui');
  const Icon = resolveIcon(bin.icon);
  const colorPreset = useMemo(
    () => (bin.color ? resolveColor(bin.color) : null),
    [bin.color],
  );
  const cardBg = colorPreset?.bg ?? QR_BG_FALLBACK;
  const [qrUrl, setQrUrl] = useState('');
  const { history } = useScanHistory(50);
  const lastScan = useMemo(
    () => history.find((entry) => entry.binId === bin.id),
    [history, bin.id],
  );

  useEffect(() => {
    let cancelled = false;
    generateQRDataURL(bin.id, QR_GEN_SIZE, { dark: QR_FG, light: cardBg }).then((url) => {
      if (!cancelled) setQrUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [bin.id, cardBg]);

  const createdAbsolute = useMemo(
    () =>
      new Date(bin.created_at).toLocaleDateString(uiLanguage, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    [bin.created_at],
  );

  return (
    <div className="flex flex-col gap-8">
      <section>
        <header className={sectionHeaderRow}>
          <h3 className={sectionHeader}>Details</h3>
        </header>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 items-start md:gap-8">
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-5 gap-y-2.5 text-[13px] self-start">
            {bin.created_by_name && (
              <>
                <dt className="text-[var(--text-tertiary)]">{tx("creator_817b79", { defaultValue: "Creator" })}</dt>
                <dd className="text-[var(--text-primary)]">{bin.created_by_name}</dd>
              </>
            )}

            <dt className="text-[var(--text-tertiary)]">{tx("created_accf40", { defaultValue: "Created" })}</dt>
            <dd className="text-[var(--text-primary)]">{createdAbsolute}</dd>

            <dt className="text-[var(--text-tertiary)]">{tx("updated_f2f857", { defaultValue: "Updated" })}</dt>
            <dd className="text-[var(--text-primary)]">{relativeTime(bin.updated_at, uiLanguage)}</dd>

            <dt className="text-[var(--text-tertiary)]">{tx("last_scanned_3ec543", { defaultValue: "Last scanned" })}</dt>
            <dd className="text-[var(--text-primary)]">
              {lastScan ? relativeTime(lastScan.scannedAt, uiLanguage) : tx("never_80c305", { defaultValue: "Never" })}
            </dd>
          </dl>

          <div
            className="p-[4px] md:p-[6px]"
            style={{
              backgroundColor: cardBg,
              borderRadius: 'var(--radius-lg)',
              border: colorPreset ? 'none' : '1px solid var(--border-flat)',
            }}
          >
            <div className="relative w-[80px] h-[80px] md:w-[108px] md:h-[108px]">
              {qrUrl && (
                <img
                  src={qrUrl}
                  alt={tx("qr_code_for_value0_1ce42e", { defaultValue: "QR code for {{value0}}", value0: bin.name })}
                  className="w-full h-full block"
                />
              )}
              {bin.icon && (
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                  style={{
                    width: '30%',
                    height: '30%',
                    backgroundColor: cardBg,
                    padding: '4px',
                  }}
                >
                  <Icon
                    style={{ width: '100%', height: '100%', color: QR_FG }}
                    strokeWidth={2.5}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <BinDetailActivitySection binId={bin.id} />

      <section>
        <header className={sectionHeaderRow}>
          <h3 className={sectionHeader}>{tx("usage_0bb186", { defaultValue: "Usage" })}</h3>
        </header>
        <BinUsageSection binId={bin.id} />
      </section>
    </div>
  );
}
