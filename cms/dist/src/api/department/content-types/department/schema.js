"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    "kind": "collectionType",
    "collectionName": "departments",
    "info": {
        "singularName": "department",
        "pluralName": "departments",
        "displayName": "机构",
        "description": "学校机构与部门"
    },
    "options": {
        "draftAndPublish": false
    },
    "pluginOptions": {},
    "attributes": {
        "name": {
            "type": "string",
            "required": true
        },
        "slug": {
            "type": "uid",
            "targetField": "name",
            "required": true,
            "unique": true
        },
        "intro": {
            "type": "text"
        },
        "responsibilities": {
            "type": "richtext"
        },
        "contactOffice": {
            "type": "string"
        },
        "contactPhone": {
            "type": "string"
        },
        "contactEmail": {
            "type": "email"
        },
        "sort": {
            "type": "integer",
            "default": 0
        },
        "parent": {
            "type": "relation",
            "relation": "manyToOne",
            "target": "api::department.department"
        }
    }
};
//# sourceMappingURL=schema.js.map