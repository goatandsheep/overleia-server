{
  "id": "Template",
  "type": "object",
  "properties": {
    "height": {
      "enum": [
        720,
        1080,
        2160
      ]
    },
    "views": {
      "type": "array",
      "minItems": 2,
      "maxItems": 4,
      "items": {
        "$ref": "View"
      }
    },
    "name": {
      "type": "string",
      "faker": "random.words"
    },
    "width": {
      "enum": [
        1280,
        1920,
        3840
      ]
    }
  },
  "required": [
    "height",
    "views",
    "name"
  ]
}