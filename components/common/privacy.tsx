import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PrivacyContent from './privacy-content';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const PrivacyPolicy = ({ open, onOpenChange }: Props) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[80%] max-w-4xl sm:max-w-6xl md:max-w-7xl lg:max-w-screen-xl xl:max-w-screen-2xl max-h-[90vh] overflow-y-auto px-8 py-6">
                <DialogHeader>
                    <DialogTitle>Chính Sách Bảo Mật</DialogTitle>
                </DialogHeader>

               <PrivacyContent />
            </DialogContent>
        </Dialog>
    );
};

export default PrivacyPolicy;