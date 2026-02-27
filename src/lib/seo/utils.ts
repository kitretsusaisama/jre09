import { Metadata } from 'next';
import { siteConfig } from './config';

type MetadataProps = {
    title?: string;
    description?: string;
    path?: string;
    image?: string;
    noIndex?: boolean;
};

/**
 * Constructs dynamic metadata for any given page
 */
export function constructMetadata({
    title,
    description,
    path = '',
    image,
    noIndex = false,
}: MetadataProps = {}): Metadata {
    const metaTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.defaultTitle;
    const metaDesc = description || siteConfig.defaultDescription;
    const metaImage = image || siteConfig.ogImage;
    const canonicalUrl = `${siteConfig.url}${path}`;

    return {
        title: title ? { default: title, template: siteConfig.titleTemplate } : siteConfig.defaultTitle,
        description: metaDesc,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title: title || siteConfig.defaultTitle,
            description: metaDesc,
            url: canonicalUrl,
            siteName: siteConfig.name,
            images: [
                {
                    url: metaImage,
                    width: 1200,
                    height: 630,
                    alt: metaTitle,
                },
            ],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: metaTitle,
            description: metaDesc,
            images: [metaImage],
            creator: siteConfig.social.twitter,
        },
        ...(noIndex && {
            robots: {
                index: false,
                follow: false,
            },
        }),
    };
}
