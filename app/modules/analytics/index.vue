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
              <div class="p-2.5 rounded-lg bg-green-500 text-white shadow-sm">
                <BarChart3 :size="22" />
              </div>
              <div>
                <h1 class="text-2xl font-bold">Analytics Module</h1>
                <p class="text-sm text-muted-foreground">
                  Data analytics and reporting dashboard
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
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <!-- Stats Cards -->
        <Card>
          <CardHeader class="pb-3">
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle class="text-3xl">$45,231.89</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-xs text-muted-foreground">
              +20.1% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-3">
            <CardDescription>Active Users</CardDescription>
            <CardTitle class="text-3xl">2,350</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-xs text-muted-foreground">+180 from last week</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-3">
            <CardDescription>Conversion Rate</CardDescription>
            <CardTitle class="text-3xl">3.6%</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-xs text-muted-foreground">
              +0.3% from yesterday
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
          <CardDescription>
            View and analyze your data in real-time
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div
            class="flex items-center justify-center h-64 bg-muted rounded-lg border"
          >
            <div class="text-center space-y-2">
              <BarChart3 :size="48" class="mx-auto text-muted-foreground" />
              <p class="text-sm text-muted-foreground">
                Chart visualization placeholder
              </p>
            </div>
          </div>
          <div class="flex gap-2">
            <Button @click="handleTestToast">
              <BarChart3 :size="16" class="mr-2" />
              Generate Report
            </Button>
            <Button variant="outline"> Export Data </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, BarChart3 } from "lucide-vue-next";

const toast = useToast();
const router = useRouter();

const goBack = () => {
  router.back();
};

const handleTestToast = () => {
  toast.success("Report generated successfully!", {
    description: "Your analytics report is ready to download",
  });
};
</script>
