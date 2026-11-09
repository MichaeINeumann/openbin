import { useTranslation } from 'react-i18next';
import './html5qrcode-overrides.css';
import type { Html5Qrcode } from 'html5-qrcode';
import { useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '@/lib/utils';

interface Html5QrcodePluginProps {
  paused?: boolean;
  onScanSuccess: (decodedText: string) => void;
}

export function Html5QrcodePlugin({ paused, onScanSuccess }: Html5QrcodePluginProps) {
  const { t: tx } = useTranslation('ui');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = 'html5-qrcode-scanner';
  const [loading, setLoading] = useState(true);
  // Keep the raw failure instead of a translated string: the camera is started
  // once on mount, so a message built there would stay in the language that was
  // active at that moment. Translating at render keeps it in sync with i18n.
  const [startError, setStartError] = useState<unknown>(null);

  useEffect(() => {
    let cancelled = false;

    import('html5-qrcode').then(({ Html5Qrcode }) => {
      if (cancelled) return;

      setLoading(false);
      const scanner = new Html5Qrcode(containerId);
      scannerRef.current = scanner;

      scanner
        .start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            onScanSuccess(decodedText);
          },
          () => {},
        )
        .then(() => {
          // Component unmounted while start() was pending — stop now
          if (cancelled && scanner.isScanning) {
            scanner.stop().catch(() => {});
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setStartError(err);
          }
        });
    });

    return () => {
      cancelled = true;
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const scanner = scannerRef.current;
    if (!scanner) return;

    try {
      if (paused && scanner.isScanning) {
        scanner.pause(true);
      } else if (!paused && scanner.getState() === 3) {
        // State 3 = PAUSED in html5-qrcode
        scanner.resume();
      }
    } catch {
      // Scanner may not be fully initialized yet
    }
  }, [paused]);

  if (startError !== null) {
    const raw = getErrorMessage(startError, '');
    const name = typeof startError === 'object' && startError !== null && 'name' in startError ? String(startError.name) : '';
    const reason = `${name} ${raw}`;
    const detail = /NotFoundError|DevicesNotFoundError/.test(reason)
      ? tx('scan_noCamera')
      : /NotAllowedError|PermissionDeniedError/.test(reason)
        ? tx('scan_cameraDenied')
        : tx('failed_to_start_camera_399727');
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-center px-4">
        <p className="text-[15px] font-medium text-[var(--text-primary)]">{tx("failed_to_start_scanner_f85cad", { defaultValue: "Failed to start scanner" })}</p>
        <p className="text-[13px] text-[var(--text-tertiary)]">{detail}</p>
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 rounded-full border-2 border-[var(--bg-active)] border-t-[var(--accent)] animate-spin" />
        </div>
      )}
      <div id={containerId} className="w-full" />
    </>
  );
}
