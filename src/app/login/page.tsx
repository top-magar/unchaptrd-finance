"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push("/");
        router.refresh();
      } else {
        setError(data.error || "Invalid password");
      }
    } catch (err) {
      setError("An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-center mb-8">
        <span className="text-2xl font-bold text-white tracking-widest uppercase">Unchaptrd</span>
      </div>
      
      <Card className="bg-zinc-950 border-zinc-800 text-zinc-200 shadow-2xl">
        <form onSubmit={handleSubmit}>
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <Lock className="h-6 w-6 text-zinc-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">Restricted Access</CardTitle>
            <CardDescription className="text-zinc-400">
              Enter the application password to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-950/30 border border-red-900/50 p-3 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">App Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-zinc-700"
                placeholder="••••••••"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-white text-zinc-950 hover:bg-zinc-200 font-medium"
              disabled={loading || !password}
            >
              {loading ? "Authenticating..." : "Login"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
