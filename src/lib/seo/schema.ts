import { siteConfig } from './config';

/**
 * Global Organization Structured Data
 */
export function getOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${siteConfig.url}/#organization`,
        name: siteConfig.name,
        description: siteConfig.defaultDescription,
        url: siteConfig.url,
        email: 'help@kriyakarm.com', // extracted from legacy HTML
        telephone: '+919643334356',   // extracted from legacy HTML
        logo: {
            '@type': 'ImageObject',
            url: `${siteConfig.url}/wp-content/uploads/2025/01/20250109_192103-1.png`,
            '@id': `${siteConfig.url}/#organizationLogo`,
        },
        image: {
            '@id': `${siteConfig.url}/#organizationLogo`,
        },
    };
}

/**
 * Global Website Schema
 */
export function getWebsiteSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${siteConfig.url}/#website`,
        url: siteConfig.url,
        name: siteConfig.name,
        alternateName: siteConfig.defaultTitle,
        description: 'Honor Your Loved Ones with Grace', // extracted
        inLanguage: siteConfig.locale,
        publisher: {
            '@id': `${siteConfig.url}/#organization`,
        },
    };
}

/**
 * WebPage Schema
 */
export function getWebPageSchema(title: string, description: string, path: string) {
    const pageUrl = `${siteConfig.url}${path}`;
    return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: title,
        description: description,
        inLanguage: siteConfig.locale,
        isPartOf: {
            '@id': `${siteConfig.url}/#website`,
        },
    };
}

/**
 * Breadcrumb Schema Generator
 */
export function getBreadcrumbSchema(items: { name: string; path: string }[]) {
    const itemListElement = [
        {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: siteConfig.url,
        },
        ...items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 2,
            name: item.name,
            item: `${siteConfig.url}${item.path}`,
        })),
    ];

    const currentPath = items.length > 0 ? items[items.length - 1].path : '';

    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        '@id': `${siteConfig.url}${currentPath}#breadcrumblist`,
        itemListElement,
    };
}
