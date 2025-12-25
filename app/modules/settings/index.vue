<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <div class="border-b bg-card">
      <div class="container mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <Button variant="ghost" size="sm" @click="goBack">
              <ArrowLeft :size="18" class="mr-2" />
              Back
            </Button>
            <div class="flex items-center gap-3">
              <div class="p-2.5 rounded-lg bg-purple-500 text-white shadow-sm">
                <Settings :size="22" />
              </div>
              <div>
                <h1 class="text-2xl font-bold">Settings Module</h1>
                <p class="text-sm text-muted-foreground">
                  Application configuration and preferences
                </p>
              </div>
            </div>
          </div>
          <Badge variant="outline">Demo</Badge>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto p-6">
      <div class="max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Manage your application preferences
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground"
                >Application Name</label
              >
              <input
                type="text"
                value="Nuxt App"
                class="w-full p-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground"
                >Description</label
              >
              <textarea
                rows="3"
                class="w-full p-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
A scalable module-based Nuxt application</textarea
              >
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription> Customize the look and feel </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium text-sm">Dark Mode</div>
                <div class="text-xs text-muted-foreground">
                  Toggle between light and dark themes
                </div>
              </div>
              <Button variant="outline" size="sm">Toggle</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Configure notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium text-sm">Email Notifications</div>
                <div class="text-xs text-muted-foreground">
                  Receive email updates
                </div>
              </div>
              <input type="checkbox" class="rounded accent-primary" checked />
            </div>
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium text-sm">Push Notifications</div>
                <div class="text-xs text-muted-foreground">
                  Get push notifications
                </div>
              </div>
              <input type="checkbox" class="rounded accent-primary" />
            </div>
          </CardContent>
        </Card>

        <div class="flex gap-2">
          <Button @click="handleTestToast">
            <Settings :size="16" class="mr-2" />
            Save Settings
          </Button>
          <Button variant="outline">Reset to Defaults</Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Settings } from "lucide-vue-next";

const toast = useToast();
const router = useRouter();

const goBack = () => {
  router.back();
};

const handleTestToast = () => {
  toast.success("Settings saved successfully!", {
    description: "Your preferences have been updated",
  });
};
</script>
