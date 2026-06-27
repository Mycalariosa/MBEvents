import { useLocalSearchParams } from 'expo-router';
import { AdminServiceForm } from '@/src/components';
import { getModuleConfig } from '@/src/constants/adminModules';

export default function AdminModuleNewScreen() {
  const { eventType, module: moduleRoute } = useLocalSearchParams<{ eventType: string; module: string }>();
  const config = getModuleConfig(eventType ?? '', moduleRoute ?? '');

  if (!config) return null;

  return (
    <AdminServiceForm
      table={config.table}
      title={config.name}
      route={`${eventType}/${config.route}`}
      eventTypeSlug={eventType}
      fields={config.fields}
      nameField={config.nameField}
      priceField={config.priceField}
    />
  );
}
