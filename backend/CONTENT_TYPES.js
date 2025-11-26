/**
 * Strapi Content Types för Ahlafors Bryggerier
 * 
 * Dessa ska skapas manuellt i Strapi Admin:
 * http://localhost:1337/admin/content-manager
 */

// 1. PRODUCT (Produkt)
// Collection Type
{
  "name": "Product",
  "fields": [
    {
      "name": "title",
      "type": "string",
      "required": true
    },
    {
      "name": "slug",
      "type": "uid",
      "targetField": "title"
    },
    {
      "name": "description",
      "type": "richtext"
    },
    {
      "name": "shortDescription",
      "type": "text"
    },
    {
      "name": "productType",
      "type": "enumeration",
      "enum": ["beer", "cider"]
    },
    {
      "name": "style",
      "type": "string",
      "description": "T.ex. Pale Ale, IPA, Märzen"
    },
    {
      "name": "alcoholContent",
      "type": "decimal"
    },
    {
      "name": "volume",
      "type": "string",
      "description": "T.ex. 330ml, 500ml"
    },
    {
      "name": "image",
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    },
    {
      "name": "gallery",
      "type": "media",
      "multiple": true,
      "allowedTypes": ["images"]
    },
    {
      "name": "systembolagetLink",
      "type": "string"
    },
    {
      "name": "featured",
      "type": "boolean",
      "default": false
    },
    {
      "name": "order",
      "type": "integer",
      "description": "Sorteringsordning"
    }
  ]
}

// 2. NEWS (Nyheter)
// Collection Type
{
  "name": "News",
  "fields": [
    {
      "name": "title",
      "type": "string",
      "required": true
    },
    {
      "name": "slug",
      "type": "uid",
      "targetField": "title"
    },
    {
      "name": "excerpt",
      "type": "text"
    },
    {
      "name": "content",
      "type": "richtext"
    },
    {
      "name": "image",
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    },
    {
      "name": "publishedAt",
      "type": "datetime"
    },
    {
      "name": "featured",
      "type": "boolean",
      "default": false
    }
  ]
}

// 3. SERVICE (Tjänster)
// Collection Type
{
  "name": "Service",
  "fields": [
    {
      "name": "title",
      "type": "string",
      "required": true
    },
    {
      "name": "slug",
      "type": "uid",
      "targetField": "title"
    },
    {
      "name": "description",
      "type": "richtext"
    },
    {
      "name": "shortDescription",
      "type": "text"
    },
    {
      "name": "icon",
      "type": "string",
      "description": "Icon namn (för frontend)"
    },
    {
      "name": "image",
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    },
    {
      "name": "order",
      "type": "integer"
    }
  ]
}

// 4. RECIPE (Recept)
// Collection Type
{
  "name": "Recipe",
  "fields": [
    {
      "name": "title",
      "type": "string",
      "required": true
    },
    {
      "name": "slug",
      "type": "uid",
      "targetField": "title"
    },
    {
      "name": "description",
      "type": "text"
    },
    {
      "name": "ingredients",
      "type": "richtext"
    },
    {
      "name": "instructions",
      "type": "richtext"
    },
    {
      "name": "prepTime",
      "type": "integer",
      "description": "Minuter"
    },
    {
      "name": "servings",
      "type": "integer"
    },
    {
      "name": "image",
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    },
    {
      "name": "products",
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::product.product"
    }
  ]
}

// 5. RULLERIET (Single Type)
// Single Type för Rulleriet-information
{
  "name": "Rulleriet",
  "singleType": true,
  "fields": [
    {
      "name": "title",
      "type": "string"
    },
    {
      "name": "description",
      "type": "richtext"
    },
    {
      "name": "openingHours",
      "type": "component",
      "repeatable": true,
      "component": "opening-hours"
    },
    {
      "name": "nextEvent",
      "type": "richtext"
    },
    {
      "name": "images",
      "type": "media",
      "multiple": true,
      "allowedTypes": ["images"]
    }
  ]
}

// Component: opening-hours
{
  "name": "opening-hours",
  "fields": [
    {
      "name": "day",
      "type": "string"
    },
    {
      "name": "hours",
      "type": "string"
    },
    {
      "name": "note",
      "type": "text"
    }
  ]
}

// 6. ABOUT (Om oss - Single Type)
{
  "name": "About",
  "singleType": true,
  "fields": [
    {
      "name": "title",
      "type": "string"
    },
    {
      "name": "tagline",
      "type": "string",
      "description": "Hantverk i varje droppe"
    },
    {
      "name": "description",
      "type": "richtext"
    },
    {
      "name": "history",
      "type": "richtext"
    },
    {
      "name": "location",
      "type": "string"
    },
    {
      "name": "foundedYear",
      "type": "integer"
    },
    {
      "name": "heroImage",
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    },
    {
      "name": "gallery",
      "type": "media",
      "multiple": true,
      "allowedTypes": ["images"]
    }
  ]
}

// 7. CONTACT (Kontakt - Single Type)
{
  "name": "Contact",
  "singleType": true,
  "fields": [
    {
      "name": "email",
      "type": "email"
    },
    {
      "name": "phone",
      "type": "string"
    },
    {
      "name": "address",
      "type": "text"
    },
    {
      "name": "socialMedia",
      "type": "component",
      "repeatable": true,
      "component": "social-link"
    }
  ]
}

// Component: social-link
{
  "name": "social-link",
  "fields": [
    {
      "name": "platform",
      "type": "string"
    },
    {
      "name": "url",
      "type": "string"
    }
  ]
}
