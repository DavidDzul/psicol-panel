<template>
  <template v-if="photos?.length">
    <div v-for="(photo, index) of photos" :key="index">
      <v-img
        :src="photoUrl(photo)"
        lazy-src="https://miro.medium.com/max/1080/0*DqHGYPBA-ANwsma2.gif"
        height="300"
        style="position: relative"
        @click="showPhoto(index)"
      >
      </v-img>
    </div>
  </template>
  <template v-else>
    <div>
      <v-sheet class="pa-10" color="warning" height="100%">
        <v-row class="fill-height" align="center" justify="center">
          <div class="text-h2">Sin foto</div>
        </v-row>
      </v-sheet>
    </div>
  </template>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { PublicPathState, useForm } from "vee-validate";
import { PropType, ref } from "vue";
import * as yup from "yup";

import { API_URL } from "../../constants";

const props = defineProps({
  modelValue: { type: Boolean, default: () => false },
  loading: { type: Boolean, default: () => false },
  photos: { type: Array, default: () => [] },
});

const corousel = ref(null);
const carouselDialog = ref(false);
const corouselFull = ref<null | number>(null);
const fab = ref<{ items: boolean[] }>({ items: [] });

const photoUrl = (value) => {
  const url = API_URL + "storage/" + value.url;
  return url;
};

const showPhoto = (index: number) => {
  corouselFull.value = index;
  carouselDialog.value = true;
};
</script>
