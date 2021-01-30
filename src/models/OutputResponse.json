{
  "id": "OutputResponse",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "faker": "random.words"
    },
    "creationDate": {
      "type": "string",
      "faker": "date.past"
    },
    "inputs": {
      "type": "array",
      "minItems": 1,
      "maxItems": 4,
      "items": {
        "type": "string",
        "faker": "random.uuid"
      }
    },
    "status": {
      "type": "string",
      "enum": [
        "In Progress",
        "Cancelled",
        "Complete"
      ]
    },
    "templateId": {
      "type": "string",
      "faker": "random.uuid"
    },
    "updatedDate": {
      "type": "string",
      "faker": "date.past"
    },
    "uuid": {
      "type": "string",
      "faker": "random.uuid"
    }
  },
  "required": [
    "creationDate",
    "inputs",
    "status",
    "templateId",
    "updatedDate",
    "uuid"
  ]
}