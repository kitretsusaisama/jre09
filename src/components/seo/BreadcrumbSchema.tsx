import React from 'react';
import StructuredData from './StructuredData';
import { getBreadcrumbSchema } from '@/src/lib/seo/schema';

type BreadcrumbSchemaProps = {
    items: { name: string; path: string }[];
};

export default function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
    const schema = getBreadcrumbSchema(items);
    return <StructuredData data={schema} />;
}
