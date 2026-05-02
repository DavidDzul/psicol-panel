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
import { ref } from "vue";
import { API_URL } from "@/constants";

interface PhotoItem {
  url: string;
}

interface Props {
  photos?: PhotoItem[];
}

const props = withDefaults(defineProps<Props>(), {
  photos: () => [],
});

const carouselDialog = ref(false);
const corouselFull = ref<number | null>(null);

const photoUrl = (value: PhotoItem): string => {
  return API_URL + "storage/" + value.url;
};

const showPhoto = (index: number) => {
  corouselFull.value = index;
  carouselDialog.value = true;
};
</script>
