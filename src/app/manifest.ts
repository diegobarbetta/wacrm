import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SignaCon CRM',
    short_name: 'SignaCon CRM',
    description: 'CRM para atendimento, vendas e automações no WhatsApp.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fafafa',
    theme_color: '#e09b1d',
    lang: 'pt-BR',
    icons: [
      {
        src: '/brand/mark-signacon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}
