import SettingsTabs from "./SettingsTabs";
import { getGlobalSettings } from "@/app/actions/settings";
import { getAdminProfile } from "@/app/actions/profile";
import { getAllLanguages } from "@/app/actions/languages";
import { getAllTranslations } from "@/app/actions/translations";

export default async function SettingsAdminPage() {
  const settings = await getGlobalSettings();
  const profile = await getAdminProfile();
  const languages = await getAllLanguages();
  const translations = await getAllTranslations();

  return (
    <SettingsTabs
      profileData={profile}
      settingsData={settings}
      languages={languages}
      translations={translations.map((t) => ({
        id: t.id,
        namespace: t.namespace,
        key: t.key,
        translations: t.translations as Record<string, string>,
      }))}
    />
  );
}
