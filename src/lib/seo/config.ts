import { Metadata } from 'next';

const isDev = process.env.NODE_ENV === 'development';
export const siteUrl = isDev ? 'http://localhost:3000' : 'https://www.kriyakarm.com';

export const siteConfig = {
    name: 'Kriyakarm.com',
    titleTemplate: '%s | Kriyakarm.com',
    defaultTitle: 'Kriyakarm.com - Simplifying Traditions for Today\'s World',
    defaultDescription: 'Kriyakarm is a nonprofit organization dedicated to guiding families through the sacred journey of Hindu funeral practices with empathy and simplicity.',
    url: siteUrl,
    ogImage: `${siteUrl}/wp-content/uploads/2025/01/pexels-photo-12601511.jpeg`,
    themeColor: '#FF9933',
    locale: 'en_US',
    social: {
        twitter: '@kriyakarm', // Placeholder, update if available
    }
};

export const defaultMetadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: siteConfig.defaultTitle,
        template: siteConfig.titleTemplate,
    },
    description: siteConfig.defaultDescription,
    openGraph: {
        type: 'website',
        locale: siteConfig.locale,
        url: siteConfig.url,
        title: siteConfig.defaultTitle,
        description: siteConfig.defaultDescription,
        siteName: siteConfig.name,
        images: [
            {
                url: siteConfig.ogImage,
                width: 1200,
                height: 630,
                alt: siteConfig.name,
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: siteConfig.defaultTitle,
        description: siteConfig.defaultDescription,
        images: [siteConfig.ogImage],
        creator: siteConfig.social.twitter,
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    alternates: {
        canonical: siteUrl,
    },
};
