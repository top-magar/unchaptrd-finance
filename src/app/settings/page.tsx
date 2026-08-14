import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Database, LayoutTemplate, Download } from "lucide-react";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-zinc-400 mt-2">Manage your application preferences and data.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Appearance & Formatting */}
        <Card className="bg-zinc-950 border-zinc-800 text-zinc-200">
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <LayoutTemplate className="h-5 w-5 text-zinc-400" />
              <CardTitle className="text-white">Preferences</CardTitle>
            </div>
            <CardDescription className="text-zinc-400">Application-wide display settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Base Currency</Label>
              <Input disabled value="Nepalese Rupee (NPR / Rs.)" className="bg-zinc-900 border-zinc-800 text-zinc-400" />
              <p className="text-xs text-zinc-500">Currency formatting is globally fixed for this workspace.</p>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="bg-zinc-950 border-zinc-800 text-zinc-200">
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-5 w-5 text-zinc-400" />
              <CardTitle className="text-white">Security & Access</CardTitle>
            </div>
            <CardDescription className="text-zinc-400">Manage who can access the dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-zinc-900/50 border border-zinc-800 p-4">
              <p className="text-sm text-zinc-400 mb-4">Authentication is currently <strong className="text-red-400 font-medium">disabled</strong>. The dashboard is accessible to anyone with the URL.</p>
              <Button disabled className="w-full sm:w-auto bg-white text-zinc-950 hover:bg-zinc-200">
                Setup Authentication (Coming Soon)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="bg-zinc-950 border-zinc-800 text-zinc-200 md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <Database className="h-5 w-5 text-zinc-400" />
              <CardTitle className="text-white">Data Management</CardTitle>
            </div>
            <CardDescription className="text-zinc-400">Export your financial data and manage the database.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" disabled className="w-full bg-zinc-900 border-zinc-800 hover:text-white hover:bg-zinc-800 justify-start">
                <Download className="mr-2 h-4 w-4" /> Export Transactions
              </Button>
              <Button variant="outline" disabled className="w-full bg-zinc-900 border-zinc-800 hover:text-white hover:bg-zinc-800 justify-start">
                <Download className="mr-2 h-4 w-4" /> Export Inventory
              </Button>
              <Button variant="outline" disabled className="w-full bg-zinc-900 border-zinc-800 hover:text-white hover:bg-zinc-800 justify-start">
                <Download className="mr-2 h-4 w-4" /> Export Sales
              </Button>
              <Button variant="outline" disabled className="w-full bg-zinc-900 border-zinc-800 hover:text-white hover:bg-zinc-800 justify-start">
                <Download className="mr-2 h-4 w-4" /> Full Database Backup
              </Button>
            </div>
            
            <div className="border-t border-zinc-800 pt-6">
              <h3 className="text-sm font-medium text-red-400 mb-2">Danger Zone</h3>
              <p className="text-sm text-zinc-400 mb-4">Actions here are irreversible. Be extremely careful.</p>
              <Button variant="destructive" disabled className="w-full sm:w-auto bg-red-950/50 text-red-400 border border-red-900 hover:bg-red-900 hover:text-white">
                Factory Reset Database
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
