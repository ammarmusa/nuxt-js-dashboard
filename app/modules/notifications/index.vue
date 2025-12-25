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
              <div class="p-2.5 rounded-lg bg-orange-500 text-white shadow-sm">
                <Bell :size="22" />
              </div>
              <div>
                <h1 class="text-2xl font-bold">Notifications Module</h1>
                <p class="text-sm text-muted-foreground">
                  Manage notifications and alerts
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
            <CardTitle>Toast Notification Examples</CardTitle>
            <CardDescription>
              Test different types of notifications throughout the app
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button @click="showSuccessToast" class="w-full">
                <Bell :size="16" class="mr-2" />
                Success Toast
              </Button>
              <Button
                variant="destructive"
                @click="showErrorToast"
                class="w-full"
              >
                <Bell :size="16" class="mr-2" />
                Error Toast
              </Button>
              <Button
                variant="outline"
                @click="showWarningToast"
                class="w-full"
              >
                <Bell :size="16" class="mr-2" />
                Warning Toast
              </Button>
              <Button variant="secondary" @click="showInfoToast" class="w-full">
                <Bell :size="16" class="mr-2" />
                Info Toast
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
            <CardDescription> Your latest activity and alerts </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div class="flex items-start gap-4 pb-4 border-b last:border-0">
                <div class="p-2 rounded-lg bg-blue-500/10">
                  <Bell :size="18" class="text-blue-500" />
                </div>
                <div class="flex-1">
                  <div class="font-medium text-sm">New user registration</div>
                  <div class="text-xs text-muted-foreground mt-1">
                    John Doe just signed up for your service
                  </div>
                  <div class="text-xs text-muted-foreground mt-1">
                    2 hours ago
                  </div>
                </div>
              </div>
              <div class="flex items-start gap-4 pb-4 border-b last:border-0">
                <div class="p-2 rounded-lg bg-green-500/10">
                  <Bell :size="18" class="text-green-500" />
                </div>
                <div class="flex-1">
                  <div class="font-medium text-sm">Payment received</div>
                  <div class="text-xs text-muted-foreground mt-1">
                    $299.00 payment has been processed
                  </div>
                  <div class="text-xs text-muted-foreground mt-1">
                    5 hours ago
                  </div>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <div class="p-2 rounded-lg bg-orange-500/10">
                  <Bell :size="18" class="text-orange-500" />
                </div>
                <div class="flex-1">
                  <div class="font-medium text-sm">System update available</div>
                  <div class="text-xs text-muted-foreground mt-1">
                    A new version is ready to install
                  </div>
                  <div class="text-xs text-muted-foreground mt-1">
                    1 day ago
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Bell } from "lucide-vue-next";

const toast = useToast();
const router = useRouter();

const goBack = () => {
  router.back();
};

const showSuccessToast = () => {
  toast.success("Success notification!", {
    description: "This is a success message with proper styling",
  });
};

const showErrorToast = () => {
  toast.error("Error notification!", {
    description: "This is an error message that stands out",
  });
};

const showWarningToast = () => {
  toast.warning("Warning notification!", {
    description: "This is a warning message to be cautious",
  });
};

const showInfoToast = () => {
  toast.info("Information notification!", {
    description: "This is an informational message",
  });
};
</script>
