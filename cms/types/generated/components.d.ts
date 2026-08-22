import type { Schema, Struct } from '@strapi/strapi';

export interface SharedFooterLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_footer_link';
  info: {
    description: '\u9875\u811A\u94FE\u63A5';
    displayName: '\u9875\u811A\u94FE\u63A5';
    icon: 'link';
  };
  attributes: {
    href: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    sort: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'shared.footer-link': SharedFooterLink;
    }
  }
}
