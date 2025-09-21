// src/app/_layout.tsx

import { Stack } from "expo-router";
import { ThemeProvider } from "../src/context/ThemeContext";
import i18n from "../src/services/i18n";
import { I18nextProvider } from "react-i18next";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function Layout() {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={{ headerShown: false }} />
        </QueryClientProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}