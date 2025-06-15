'use client';

import { useEffect, useState } from 'react';
import { useAuthGuard } from '@/lib/useAuth';
import { logout, getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getProjects, createProject, Project } from '@/lib/projectApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, LogOut, Folder, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function DashboardPage() {
  useAuthGuard();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectName, setProjectName] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    loadProjects();

    const loadUser = async () => {
      try {
        const user = await getCurrentUser();
        setUserName(user.name);
      } catch (err) {
        console.error('Gagal memuat data user:', err);
      }
    };

    loadUser();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProject = async () => {
    if (!projectName) return;
    try {
      await createProject(projectName);
      setProjectName('');
      setOpenDialog(false);
      loadProjects();
    } catch (err) {
      alert('Gagal menambah project');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getAvatarFallback = () => {
    if (!userName) return 'U';
    return userName.charAt(0).toUpperCase();
  };


  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <div className="flex items-center gap-4">
            {userName && (
              <span className="text-sm text-gray-700 font-medium hidden md:block">
                {userName}
              </span>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                  <Avatar className="h-10 w-10 bg-blue-500">
                    <AvatarFallback className="bg-blue-500 text-white">
                      {getAvatarFallback()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer focus:bg-red-50 focus:text-red-500"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Daftar Project</h2>
          <Button
            onClick={() => setOpenDialog(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Tambah Project
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => (
          <Card
            key={p.id}
            onClick={() => router.push(`/projects/${p.id}`)}
            className="cursor-pointer p-4 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Folder className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {p.name}
                  </h3>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <p className="text-xs text-gray-500 mt-1">ID: {p.id}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {projects.length === 0 && (
        <Card className="p-6 text-center">
          <div className="text-gray-500 flex flex-col items-center">
            <Folder className="w-10 h-10 text-gray-300 mb-2" />
            <p>Belum ada project</p>
            <p className="text-sm mt-2">Klik "Tambah Project" untuk membuat project baru</p>
          </div>
        </Card>
      )}

      {/* Add Project Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Buat Project Baru
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Nama Project</label>
              <Input
                placeholder="Masukkan nama project"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setOpenDialog(false)}
              variant="outline"
            >
              Batal
            </Button>
            <Button
              onClick={handleAddProject}
              disabled={!projectName}
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
