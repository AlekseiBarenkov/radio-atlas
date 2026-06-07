import { SyncSettingsSection } from '@features/cloud-sync';
import { useTranslation } from '@/features/localization';
import { PageHeader, PageShell } from '@/shared/ui';

export const SettingsPage = () => {
  const t = useTranslation();

  return (
    <PageShell>
      <PageHeader title={t.settings.title} description={t.settings.description} />
      <SyncSettingsSection />
    </PageShell>
  );
};
