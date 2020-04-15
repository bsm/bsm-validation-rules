# BSM Validation Rules

Validation rule builder, written in TypeScript.

## Usage

```javascript
import rules from 'bsm-validation-rules';

const percentage = [
  rules.typeOf('number'),
  rules.numericality({ min: 0, max: 100 }),
];

export const taskRules = {
  title: [
    rules.presence(),
    rules.typeOf('string'),
  ],
  status: [
    rules.presence(),
    rules.typeOf('string'),
    rules.inclusion(['pending', 'complete']),
  ],
  progress: [
    rules.presence(),
    ...percentage,
  ],
});
```

In Vue/Vuetify:

```html
<template>
  <form>
    <v-text-field label="Title" v-model="item.title" :rules="rules.title" />
  </form>
</template>

<script>
import rules from 'bsm-validation-rules';

const rules = {
  title: [
    rules.presence(),
    rules.typeOf('string'),
    rules.format(/\S+@\S+\.\S+/),
  ],
};

export default {
  data: () => ({ rules }),
}
```
