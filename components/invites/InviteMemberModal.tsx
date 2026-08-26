'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Copy, Check, Loader2, Link as LinkIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';

interface InviteMemberDialogProps {
  organizationId: string;
}

export function InviteMemberDialog({ organizationId }: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'MEMBER' | 'ADMIN' | 'VIEWER'>('MEMBER');
  const [loading, setLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          role,
          invitedEmail: email.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate invite');

      setInviteUrl(data.inviteUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleClose(isOpen: boolean) {
    setOpen(isOpen);
    if (!isOpen) {
      setInviteUrl(null);
      setEmail('');
      setError(null);
      setCopied(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 bg-purple-600 hover:bg-purple-500 text-white text-xs">
          <UserPlus className="h-3.5 w-3.5" /> Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Invite Team Member</DialogTitle>
        </DialogHeader>

        {!inviteUrl ? (
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Restricted Email (Optional)</Label>
              <Input
                placeholder="developer@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-xs"
              />
              <p className="text-[11px] text-zinc-500">
                Leave empty to allow anyone with this invite link to join.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Workspace Role</Label>
              <Select value={role} onValueChange={(val: any) => setRole(val)}>
                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-xs">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                  <SelectItem value="MEMBER">Member (Full SRE & War Room Access)</SelectItem>
                  <SelectItem value="ADMIN">Admin (Manage Team & Settings)</SelectItem>
                  <SelectItem value="VIEWER">Viewer (Read Only)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <p className="text-xs text-red-400 font-mono">{error}</p>
            )}

            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white text-xs gap-2"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LinkIcon className="h-3.5 w-3.5" />}
              Generate Invite Link
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-800/40 text-xs text-purple-300">
              Invite link active. Valid for 7 days.
            </div>

            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={inviteUrl}
                className="bg-zinc-900 border-zinc-800 text-xs font-mono select-all"
              />
              <Button size="sm" onClick={handleCopy} className="bg-zinc-800 hover:bg-zinc-700 shrink-0">
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={() => setInviteUrl(null)}
              className="w-full text-xs border-zinc-800 hover:bg-zinc-900 text-zinc-400"
            >
              Generate Another Link
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}