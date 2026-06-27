import { useLocalSearchParams } from 'expo-router';
import { AdminServiceForm } from '@/src/components';
import { getModuleConfig } from '@/src/constants/adminModules';

export default function AdminModuleEditScreen() {
  const { eventType, module: moduleRoute, id } = useLocalSearchParams<{ eventType: string; module: string; id: string }>();
  const config = getModuleConfig(eventType ?? '', moduleRoute ?? '');

  if (!config) return null;

  return (
    <AdminServiceForm
      table={config.table}
      title={config.name}
      route={`${eventType}/${config.route}`}
      id={id}
      eventTypeSlug={eventType}
      fields={config.fields}
      nameField={config.nameField}
      priceField={config.priceField}
    />
  );
}
