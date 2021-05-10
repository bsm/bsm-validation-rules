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

```vue
<template>
  <v-container fluid>
    <v-row align="center">
      <v-col cols="6">
        <v-text-field
          v-model="item.email"
          label="Email"
          :rules="rules.email"
        ></v-text-field>
      </v-col>

      <v-col cols="6">
        <v-select
          v-model="item.state"
          label="State"
          :rules="rules.email"
          :items="states"
          item-text="state"
          item-value="abbr"
          return-object
        ></v-select>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import vrb from 'bsm-validation-rules';

const rules = {
  email: [
    vrb.presence(),
    vrb.typeOf('string'),
    vrb.format(/\S+@\S+\.\S+/),
  ],
  state: [
    vrb.dig('abbr', [
      vrb.presence(),
      vrb.typeOf('string'),
    ]),
  ],
};

export default {
  data: () => ({
    rules,
    item: {},
    states: [
      { state: 'Florida', abbr: 'FL' },
      { state: 'Georgia', abbr: 'GA' },
      { state: 'Nebraska', abbr: 'NE' },
      { state: 'California', abbr: 'CA' },
      { state: 'New York', abbr: 'NY' },
    ],
  }),
}
```
