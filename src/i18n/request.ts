import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  // This distribution targets Brazil. Keep the env override for forks,
  // but make pt-BR the production-safe default.
  const locale = process.env.NEXT_PUBLIC_APP_LOCALE || 'pt-BR';

  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    // A mistyped override must still render the Brazilian dictionary rather
    // than silently switching a production deployment back to English.
    messages = (await import(`../../messages/pt-BR.json`)).default;
  }

  return {
    locale,
    messages,
  };
});
