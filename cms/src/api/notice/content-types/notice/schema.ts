export default {
  "kind": "collectionType",
  "collectionName": "notices",
  "info": {
    "singularName": "notice",
    "pluralName": "notices",
    "displayName": "通知公告",
    "description": "学校与部门通知公告"
  },
  "options": {
    "draftAndPublish": true
  },
  "pluginOptions": {},
  "attributes": {
    "title": {
      "type": "string",
      "required": true
    },
    "slug": {
      "type": "uid",
      "targetField": "title",
      "required": true,
      "unique": true
    },
    "summary": {
      "type": "text"
    },
    "content": {
      "type": "richtext"
    },
    "cover": {
      "type": "media",
      "multiple": false,
      "required": false,
      "allowedTypes": [
        "images"
      ]
    },
    "noticeNo": {
      "type": "string"
    },
    "level": {
      "type": "enumeration",
      "enum": [
        "school",
        "dept"
      ],
      "default": "school"
    },
    "effectiveDate": {
      "type": "date"
    },
    "expireDate": {
      "type": "date"
    },
    "attachments": {
      "type": "media",
      "multiple": true,
      "required": false,
      "allowedTypes": [
        "images",
        "files"
      ]
    },
    "isTop": {
      "type": "boolean",
      "default": false
    },
    "moderationStatus": {
      "type": "enumeration",
      "enum": [
        "draft",
        "in_review",
        "approved",
        "published",
        "archived"
      ],
      "default": "draft"
    },
    "seoTitle": {
      "type": "string"
    },
    "seoDescription": {
      "type": "text"
    }
  }
};
