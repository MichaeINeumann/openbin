import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CAMERA_TIPS } from './tips';

interface HelpSheetProps {
	isOpen: boolean;
	onClose: () => void;
}

export function HelpSheet({ isOpen, onClose }: HelpSheetProps) {
  const { t: tx } = useTranslation('ui');
	return (
		<Dialog open={isOpen} onOpenChange={(next) => { if (!next) onClose(); }}>
			<DialogContent className="max-w-sm" centered>
				<DialogHeader>
					<DialogTitle>{tx("photo_tips_4b4e86", { defaultValue: "Photo tips" })}</DialogTitle>
				</DialogHeader>
				<ul className="flex flex-col gap-3">
					{CAMERA_TIPS.map((tip) => {
						const Icon = tip.icon;
						return (
							<li key={tip.id} className="flex items-center gap-3">
								<span
									aria-hidden="true"
									className="w-8 flex items-center justify-center text-[var(--text-secondary)] shrink-0"
								>
									<Icon className="h-5 w-5" strokeWidth={2} />
								</span>
								<p className="text-[15px] leading-snug text-[var(--text-primary)]">
									{tip.headline}
								</p>
							</li>
						);
					})}
				</ul>
				<DialogFooter>
					<Button
						variant="default"
						size="lg"
						onClick={onClose}
						className="w-full sm:w-auto"
					> {tx("got_it_5b8027", { defaultValue: "Got it" })} </Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
