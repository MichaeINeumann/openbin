import { Camera } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface CameraStartScreenProps {
  hasCamera: boolean;
  error: string | null;
  onStart: () => void;
  onCancel: () => void;
  /** Slot rendered below the start button on the ready branch (e.g. TourLauncher). */
  readyExtras?: ReactNode;
}

export function CameraStartScreen({
  hasCamera,
  error,
  onStart,
  onCancel,
  readyExtras,
}: CameraStartScreenProps) {
  const { t: tx } = useTranslation('ui');
  return (
    <div className="absolute inset-0 z-20 bg-[var(--bg-base)] flex flex-col items-center justify-center gap-5 px-6">
      {!hasCamera ? (
        <>
          <Camera className="h-16 w-16 text-[var(--text-tertiary)]" />
          <h2 className="text-[17px] font-semibold text-[var(--text-primary)] text-center"> {tx("camera_not_available_95c8d1", { defaultValue: "Camera not available" })} </h2>
          <p className="text-[14px] text-[var(--text-secondary)] text-center max-w-sm"> {tx("your_browser_does_not_support_camera_access_make_sure_you_ar_639343", { defaultValue: "Your browser does not support camera access. Make sure you are using HTTPS." })} </p>
          <Button variant="outline" onClick={onCancel}> {tx("go_back_f03e2d", { defaultValue: "Go Back" })} </Button>
        </>
      ) : error ? (
        <>
          <Camera className="h-16 w-16 text-[var(--destructive)] opacity-60" />
          <p className="text-[15px] text-[var(--text-primary)] text-center max-w-sm font-medium">
            {error}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onCancel}> {tx("go_back_f03e2d", { defaultValue: "Go Back" })} </Button>
            <Button onClick={onStart}>{tx("try_again_cef2fe", { defaultValue: "Try Again" })}</Button>
          </div>
        </>
      ) : (
        <>
          <Camera className="h-16 w-16 text-[var(--accent)] opacity-80" />
          <h2 className="text-[17px] font-semibold text-[var(--text-primary)]"> {tx("ready_to_capture_3d77df", { defaultValue: "Ready to capture" })} </h2>
          <p className="text-[14px] text-[var(--text-secondary)] text-center max-w-sm"> {tx("tap_the_button_below_to_start_the_camera_and_take_photos_5f7f42", { defaultValue: "Tap the button below to start the camera and take photos." })} </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onCancel}> {tx("cancel_77dfd2", { defaultValue: "Cancel" })} </Button>
            <Button onClick={onStart}>{tx("start_camera_701424", { defaultValue: "Start Camera" })}</Button>
          </div>
          {readyExtras}
        </>
      )}
    </div>
  );
}
