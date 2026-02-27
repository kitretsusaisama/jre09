import React from 'react';
import fs from 'fs';
import path from 'path';
import ScriptInjector from './ScriptInjector';

const getReactAttrName = (key: string) => {
    const map: Record<string, string> = {
        'class': 'className',
        'charset': 'charSet',
        'http-equiv': 'httpEquiv',
        'itemprop': 'itemProp',
        'hreflang': 'hrefLang',
        'crossorigin': 'crossOrigin',
        'nomodule': 'noModule',
    };
    return map[key.toLowerCase()] || key;
};

const parseAttributes = (attrsString: string) => {
    const attrs: Record<string, string> = {};
    const attrRegex = /([a-zA-Z0-9_:-]+)\s*=\s*(["'])([\s\S]*?)\2/g;
    let match;
    while ((match = attrRegex.exec(attrsString)) !== null) {
        const key = getReactAttrName(match[1]);
        attrs[key] = match[3];
    }
    return attrs;
};

const extractScripts = (html: string) => {
    const scripts: string[] = [];
    const ldJsonScripts: { content: string, attrs: Record<string, string> }[] = [];

    const cleanHtml = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (match, attrString, content) => {
        const attrs = parseAttributes(attrString);
        if (attrs.type && attrs.type.toLowerCase() === 'application/ld+json') {
            ldJsonScripts.push({ content, attrs });
            return '';
        }
        scripts.push(match);
        return '';
    });
    return { cleanHtml, scripts, ldJsonScripts };
};

const extractSeoTags = (html: string) => {
    const seoTags: React.ReactNode[] = [];
    let cleanHtml = html;

    // Extract Title
    cleanHtml = cleanHtml.replace(/<title>([\s\S]*?)<\/title>/gi, (match, content) => {
        seoTags.push(<title key={`title-${seoTags.length}`}>{content}</title>);
        return '';
    });

    // Extract Meta
    cleanHtml = cleanHtml.replace(/<meta\s+([^>]+)>/gi, (match, attrString) => {
        const attrs = parseAttributes(attrString);
        if (attrs.name && attrs.name.toLowerCase() === 'viewport') {
            return ''; // Discard viewport as Next.js layout handles it
        }
        seoTags.push(<meta key={`meta-${seoTags.length}`} {...attrs} />);
        return '';
    });

    // Extract Link (excluding stylesheets)
    cleanHtml = cleanHtml.replace(/<link\s+([^>]+)>/gi, (match, attrString) => {
        const attrs = parseAttributes(attrString);
        if (attrs.rel && attrs.rel.toLowerCase() === 'stylesheet') {
            return match;
        }
        seoTags.push(<link key={`link-${seoTags.length}`} {...attrs} />);
        return '';
    });

    return { cleanHtml, seoTags };
};

export default function HtmlWrapper({ filename }: { filename: string }) {
    // Read from the static-export directory
    const filePath = path.join(process.cwd(), 'static-export/', filename);
    let htmlContent = '';

    try {
        htmlContent = fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.error(`Error reading HTML file: ${filePath}`, error);
        return <div>Error loading page. Please make sure {filename} exists in the static-export folder.</div>;
    }

    // Extract head and body contents (ignoring the wrapping tags themselves)
    const headMatch = htmlContent.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
    const bodyMatch = htmlContent.match(/<body([^>]*)>([\s\S]*?)<\/body>/i);

    let headContent = headMatch ? headMatch[1] : '';
    const bodyAttrs = bodyMatch ? bodyMatch[1] : '';
    let bodyContent = bodyMatch ? bodyMatch[2] : htmlContent; // Fallback to raw if no body tag found

    const classMatch = bodyAttrs.match(/class=["']([^"']+)["']/i);
    const bodyClass = classMatch ? classMatch[1] : '';

    // Standard URLs URLs
    const domainRegex = /https?:\/\/(www\.)?kriyakarm\.com\/?/g;
    const localhostRegex = /https?:\/\/localhost\/kriyakarm\/?/g;
    const localhostBareRegex = /https?:\/\/localhost\/?/g;

    // JSON Escaped URLs (e.g. https:\/\/kriyakarm.com\/)
    const domainEscapedRegex = /https?:\\\/\\\/(www\.)?kriyakarm\.com(\\\/)?/g;
    const localhostEscapedRegex = /https?:\\\/\\\/localhost\\\/kriyakarm(\\\/)?/g;
    const localhostBareEscapedRegex = /https?:\\\/\\\/localhost(\\\/)?/g;

    headContent = headContent
        .replace(domainRegex, '/')
        .replace(localhostRegex, '/')
        .replace(localhostBareRegex, '/')
        .replace(domainEscapedRegex, '\\/')
        .replace(localhostEscapedRegex, '\\/')
        .replace(localhostBareEscapedRegex, '\\/');

    bodyContent = bodyContent
        .replace(domainRegex, '/')
        .replace(localhostRegex, '/')
        .replace(localhostBareRegex, '/')
        .replace(domainEscapedRegex, '\\/')
        .replace(localhostEscapedRegex, '\\/')
        .replace(localhostBareEscapedRegex, '\\/');

    // Rewrite internal links ending in .html to remove the extension for Next.js routing
    // Also remove '/index' from the end of paths
    const rewriteHref = (match: string, p1: string) => {
        let noHtml = p1.replace('.html', '');
        noHtml = noHtml.replace(/\/index$/, '');
        if (noHtml === 'index') {
            noHtml = '/';
        } else if (noHtml === '') {
            noHtml = '/';
        } else if (!noHtml.startsWith('/') && !noHtml.startsWith('http')) {
            // relative link that might need to be absolute, but we'll leave as is if not starting with /
        }
        return `href="${noHtml}"`;
    };

    bodyContent = bodyContent.replace(/href=["']([^"']*\.html)["']/gi, rewriteHref);
    headContent = headContent.replace(/href=["']([^"']*\.html)["']/gi, rewriteHref);

    const headScriptsData = extractScripts(headContent);
    const bodyScriptsData = extractScripts(bodyContent);

    const seoExtraction = extractSeoTags(headScriptsData.cleanHtml);
    const headSeoTags = seoExtraction.seoTags;
    const finalHeadHtml = seoExtraction.cleanHtml;

    return (
        <>
            {headSeoTags}

            {headScriptsData.ldJsonScripts.map((script, i) => (
                <script key={`head-ld-${i}`} {...script.attrs} dangerouslySetInnerHTML={{ __html: script.content }} />
            ))}
            {bodyScriptsData.ldJsonScripts.map((script, i) => (
                <script key={`body-ld-${i}`} {...script.attrs} dangerouslySetInnerHTML={{ __html: script.content }} />
            ))}

            {finalHeadHtml && (
                <div
                    className={`html-wrapper-head html-${filename.split('.')[0]}`}
                    dangerouslySetInnerHTML={{ __html: finalHeadHtml }}
                    suppressHydrationWarning
                />
            )}
            <div
                className={`html-wrapper-body html-${filename.split('.')[0]} ${bodyClass}`}
                dangerouslySetInnerHTML={{ __html: bodyScriptsData.cleanHtml }}
                suppressHydrationWarning
            />
            <ScriptInjector scripts={[...headScriptsData.scripts, ...bodyScriptsData.scripts]} />
        </>
    );
}
