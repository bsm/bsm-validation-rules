# BSM Validation Rules

Validation rule builder, written in TypeScript.

## Usage

```javascript
import vrb from 'bsm-validation-rules';

const percentage = [
  vrb.typeOf('number'),
  vrb.numericality({ min: 0, max: 100 }),
];

export const taskRules = {
  title: [
    vrb.presence(),
    vrb.typeOf('string'),
    vrb.length({ max: 50 }),
  ],
  status: [
    vrb.presence(),
    vrb.typeOf('string'),
    vrb.inclusion(['pending', 'complete']),
  ],
  progress: [
    vrb.presence(),
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
import vrb from 'bsm-validation-rules';

const rules = {
  title: [
    vrb.presence(),
    vrb.typeOf('string'),
    vrb.format(/\S+@\S+\.\S+/),
  ],
};

export default {
  data: () => ({ rules }),
}
```
