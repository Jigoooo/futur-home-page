import { TermsContent } from './terms-content';
import { PageScrollbar } from '@/shared/ui/page-scrollbar';

export function TermsPage() {
  return (
    <>
      <main>
        <TermsContent />
      </main>
      <PageScrollbar />
    </>
  );
}
