import { put } from "@vercel/blob";
import { getServerSession } from "@/lib/auth-helpers";

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  const blob = await put(file.name, file, {
    access: "public",
    addRandomSuffix: true,
  });

  return Response.json({
    url: blob.url,
    downloadUrl: blob.downloadUrl,
    pathname: blob.pathname,
  });
}
