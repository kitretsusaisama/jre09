'use client';

import { useEffect } from 'react';

// Global maps and sets to track scripts that have already been injected and executed
// across page navigations and React Strict Mode double-invocations.
const scriptPromises = new Map<string, Promise<void>>();
const executedScripts = new Set<string>();

export default function ScriptInjector({
    scripts
}: {
    scripts: string[];
}) {
    useEffect(() => {
        if (!scripts || scripts.length === 0) return;

        // Create a temporary div to parse the raw HTML script tags
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = scripts.join('');
        const parsedScripts = Array.from(tempDiv.querySelectorAll('script'));

        const injectScriptsSequentially = async () => {
            for (const oldScript of parsedScripts) {
                const src = oldScript.getAttribute('src');
                const content = oldScript.innerHTML.trim();

                // If it's an external script...
                if (src) {
                    // If another injector is already loading this script, await its promise
                    if (scriptPromises.has(src)) {
                        await scriptPromises.get(src);
                        continue;
                    }

                    // Otherwise, start loading it and store its promise globally
                    const promise = new Promise<void>((resolve) => {
                        const newScript = document.createElement('script');

                        // Copy all attributes (like src, type, id, etc.)
                        Array.from(oldScript.attributes).forEach(attr => {
                            newScript.setAttribute(attr.name, attr.value);
                        });

                        newScript.onload = () => resolve();
                        newScript.onerror = (e) => {
                            console.error(`Failed to load script: ${src}`, e);
                            resolve(); // Resolve anyway so we don't break the chain
                        };

                        // Append to the actual document body to execute
                        document.body.appendChild(newScript);
                    });

                    scriptPromises.set(src, promise);
                    await promise;
                }
                // If it's an inline script...
                else if (content) {
                    // Avoid duplicate execution by content hash (survives React Strict Mode remounts)
                    if (executedScripts.has(content)) continue;
                    executedScripts.add(content);

                    await new Promise<void>((resolve) => {
                        const newScript = document.createElement('script');

                        // Copy all attributes
                        Array.from(oldScript.attributes).forEach(attr => {
                            newScript.setAttribute(attr.name, attr.value);
                        });

                        newScript.appendChild(document.createTextNode(content));

                        // Append to force browser execution synchronously
                        document.body.appendChild(newScript);
                        resolve();
                    });
                }
            }
        };

        injectScriptsSequentially();
    }, [scripts]);

    // We no longer render any DOM container since scripts are appended to document.body directly.
    return null;
}
