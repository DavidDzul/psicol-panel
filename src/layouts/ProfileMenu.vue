<template>
  <v-menu>
    <template v-slot:activator="{ props }">
      <v-btn icon class="mr-0" v-bind="props">
        <v-avatar color="#FFCE00">
          <span class="text-h5">{{ initials }}</span>
        </v-avatar>
      </v-btn>
    </template>
    <v-card>
      <v-list>
        <v-list-item>
          <div class="mx-auto text-center">
            <v-avatar color="#FFCE00">
              <span class="text-h5">{{ initials }}</span>
            </v-avatar>
            <h3>{{ fullName }}</h3>
            <p class="mt-1">{{ user.email }}</p>
          </div>
        </v-list-item>
        <v-divider class="my-3"></v-divider>
        <v-list-item
          prepend-icon="mdi-cog"
          title="Configurar"
          @click="$emit('configuration')"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-exit-to-app"
          title="Cerrar sesión"
          @click="$emit('logout')"
        ></v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script setup>
defineProps({
  initials: { type: String, required: true },
  fullName: { type: String, required: true },
  user: { type: Object, required: true },
});
</script>
