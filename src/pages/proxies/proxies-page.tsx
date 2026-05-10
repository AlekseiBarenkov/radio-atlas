import { ProxySettings } from '@features/player-proxy';
import { useTranslation } from '@/features/localization';
import { PageHeader, PageShell } from '@/shared/ui';

export const ProxiesPage = () => {
  const t = useTranslation();

  return (
    <PageShell>
      <PageHeader title={t.proxySettings.title} description={t.proxySettings.description} />
      <ProxySettings />
    </PageShell>
  );
};
