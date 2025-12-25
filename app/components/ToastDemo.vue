<template>
  <Card class="w-full max-w-md">
    <CardHeader>
      <h3 class="text-lg font-semibold">Toast Notification Demo</h3>
      <p class="text-sm text-muted-foreground">
        Test all toast types from this reusable component
      </p>
    </CardHeader>
    <CardContent class="space-y-3">
      <div class="grid grid-cols-2 gap-2">
        <Button variant="default" @click="showSuccess">
          <Check :size="16" class="mr-2" />
          Success
        </Button>
        <Button variant="destructive" @click="showError">
          <XCircle :size="16" class="mr-2" />
          Error
        </Button>
        <Button variant="secondary" @click="showInfo">
          <Info :size="16" class="mr-2" />
          Info
        </Button>
        <Button variant="outline" @click="showWarning">
          <AlertTriangle :size="16" class="mr-2" />
          Warning
        </Button>
      </div>

      <div class="pt-2 border-t">
        <Button class="w-full" variant="outline" @click="showPromiseToast">
          <Loader2 :size="16" class="mr-2" />
          Promise Toast
        </Button>
      </div>

      <div class="pt-2 border-t">
        <Button class="w-full" variant="outline" @click="showCustomToast">
          <Sparkles :size="16" class="mr-2" />
          Custom Toast
        </Button>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import {
  Check,
  XCircle,
  Info,
  AlertTriangle,
  Loader2,
  Sparkles,
} from "lucide-vue-next";

const toast = useToast();

const showSuccess = () => {
  toast.success("Success!", {
    description: "Your action was completed successfully",
  });
};

const showError = () => {
  toast.error("Error occurred!", {
    description: "Something went wrong. Please try again.",
  });
};

const showInfo = () => {
  toast.info("Information", {
    description: "Here is some useful information for you",
  });
};

const showWarning = () => {
  toast.warning("Warning!", {
    description: "Please review this before proceeding",
  });
};

const showPromiseToast = () => {
  const promise = new Promise((resolve) => {
    setTimeout(() => resolve("Data loaded"), 2000);
  });

  toast.promise(promise, {
    loading: "Loading data...",
    success: "Data loaded successfully!",
    error: "Failed to load data",
  });
};

const showCustomToast = () => {
  toast.success("Custom styled toast!", {
    description: "This toast has custom configuration",
    duration: 5000,
    action: {
      label: "Undo",
      onClick: () => toast.info("Undo clicked!"),
    },
  });
};
</script>
