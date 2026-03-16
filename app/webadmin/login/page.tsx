import { getGlobalSettings } from "@/app/actions/settings";
import LoginClient from "./LoginClient";

export default async function LoginPage() {
  const settings = await getGlobalSettings();

  return (
    <LoginClient
      logo={settings.logo ?? undefined}
      siteName={settings.siteName ?? undefined}
    />
  );
}
