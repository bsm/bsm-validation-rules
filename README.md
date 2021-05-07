# BSM Validation Rules

Validation rule builder, written in TypeScript.

## Usage

```javascript
import vrb from 'bsm-validation-rules';

const percentage = [
  vrb.typeOf('number'),
  vrb.numericality({ min: 0, max: 100 }),
];

const tag = [
  vrb.presence(),
  vrb.typeOf('string'),
  vrb.length({ max: 20 }),
  vrb.format(/^[A-Za-z0-9]+(\-[A-Za-z0-9])*$/),
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
  tags: [
    vrb.typeOf('array'),
    vrb.every([tag]),
  ]
});
```

In Vue/Vuetify:

```html
<template>
  <form>
    <v-text-field label="Email" v-model="item.email" :rules="rules.email" />
  </form>
</template>

<script>
import vrb from 'bsm-validation-rules';

const rules = {
  email: [
    vrb.presence(),
    vrb.typeOf('string'),
    vrb.format(/\S+@\S+\.\S+/),
  ],
};

export default {
  data: () => ({
    rules,
    item: {},
  }),
}
```
