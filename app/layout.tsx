import { getSession } from "@/lib/auth/auth.config";
import { Providers } from "@/app/providers";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="en">
      <body>
        <TooltipProvider>
          <Providers session={session}>
            <Toaster position="top-right" richColors />
          </Providers>
        </TooltipProvider>
      </body>
    </html>
  );
}
