"use client";

import { Button } from "@/components/ui/button";
import { Layout, Center } from "@/components/ds";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Layout>
      <body>
        <Center>
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="text-muted-foreground">
            {error.message || "An unexpected error occurred"}
          </p>
          <Button onClick={reset}>Try again</Button>
        </Center>
      </body>
    </Layout>
  );
}
