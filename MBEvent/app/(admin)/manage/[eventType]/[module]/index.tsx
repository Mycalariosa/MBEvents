import { useLocalSearchParams } from 'expo-router';
import { AdminServiceList } from '@/src/components';
import { getModuleConfig } from '@/src/constants/adminModules';

export default function AdminModuleListScreen() {
  const { eventType, module: moduleRoute } = useLocalSearchParams<{ eventType: string; module: string }>();
  const config = getModuleConfig(eventType ?? '', moduleRoute ?? '');

  if (!config) return null;

  return (
    <AdminServiceList
      table={config.table}
      title={config.name}
      eventTypeSlug={eventType}
      route={`${eventType}/${config.route}`}
    />
  );
}
