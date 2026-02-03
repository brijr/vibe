import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Center } from "@/components/ds";

export default function NotFound() {
  return (
    <Center>
      <h1 className="text-6xl font-bold">404</h1>
      <h2 className="text-xl font-semibold">Page Not Found</h2>
      <p className="text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link href="/">
        <Button>Go Home</Button>
      </Link>
    </Center>
  );
}
