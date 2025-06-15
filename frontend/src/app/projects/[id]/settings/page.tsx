'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Mail, Trash, ArrowLeft, Check, ChevronsUpDown, Users, AlertTriangle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { getToken } from '@/lib/auth'
import { searchUsers } from '@/lib/usersApi'
import { getProjectDetails, sendProjectInvite, removeProjectMember, deleteProject } from '@/lib/projectApi'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default function ProjectSettingsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [openCombobox, setOpenCombobox] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [userSuggestions, setUserSuggestions] = useState<string[]>([])
  const [project, setProject] = useState<{
    id: string
    name: string
    members: { user: { id: string; email: string } }[]
  } | null>(null)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentUserEmail, setCurrentUserEmail] = useState('')
  const [memberToDelete, setMemberToDelete] = useState<{ userId: string; email: string } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = getToken()
        if (!token) {
          router.push('/login')
          return
        }

        const payload = JSON.parse(atob(token.split('.')[1]))
        setCurrentUserEmail(payload.email)

        const projectData = await getProjectDetails(id as string)
        setProject(projectData)
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }
    loadData()
  }, [id, router])

  const searchUsersHandler = async (query: string) => {
    if (query.length < 3) {
      setUserSuggestions([])
      return
    }

    setIsSearching(true)
    try {
      const users = await searchUsers(query)
      const existingEmails = project?.members.map(m => m.user.email) || []
      const suggestions = users
        .filter(user => !existingEmails.includes(user.email))
        .map(user => user.email)

      setUserSuggestions(suggestions)
    } catch (error) {
      console.error('Search failed:', error)
      setUserSuggestions([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleInvite = async () => {
    if (!email || !project) return

    try {
      await sendProjectInvite(project.id, email)
      const updatedProject = await getProjectDetails(project.id)
      setProject(updatedProject)
      setEmail('')
      alert('Undangan berhasil dikirim')
    } catch (error) {
      console.error('Gagal mengirim undangan:', error)
      alert('Gagal mengirim undangan')
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!project || !userId) return;

    try {
      await removeProjectMember(project.id, userId);

      const updated = await getProjectDetails(project.id);
      setProject(updated);
      setMemberToDelete(null);
      alert('Anggota berhasil dihapus dan tugas dipindahkan ke owner');
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus anggota');
    }
  };


  const handleDeleteProject = async () => {
    if (!project) return

    setIsDeleting(true)
    try {
      await deleteProject(project.id)
      router.push('/dashboard')
    } catch (error) {
      console.error('Gagal menghapus project:', error)
      alert('Gagal menghapus project')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!project) return (
    <div className="p-6 flex justify-center">
      <div className="animate-pulse text-gray-500">Memuat project...</div>
    </div>
  )

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col space-y-4">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="w-fit gap-2 px-0 hover:bg-transparent hover:underline"
          onClick={() => router.back()}
        >
          <div className="flex items-center cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Project
          </div>
        </Button>

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Pengaturan Project</h1>
          <div className="text-sm text-gray-500">Project: {project.name}</div>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="p-6 shadow-sm border-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Undang Anggota Baru</h2>
              <p className="text-sm text-gray-600">
                Undang anggota baru untuk berkolaborasi dalam project
              </p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <div className="flex-1">
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCombobox}
                      className="w-full justify-between"
                    >
                      {email || "Cari email anggota..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Cari email..."
                        value={email}
                        onValueChange={(value) => {
                          setEmail(value)
                          searchUsersHandler(value)
                        }}
                      />
                      <CommandList>
                        {isSearching ? (
                          <CommandEmpty>Mencari...</CommandEmpty>
                        ) : userSuggestions.length === 0 ? (
                          <CommandEmpty>Email tidak ditemukan</CommandEmpty>
                        ) : (
                          <CommandGroup>
                            {userSuggestions.map((suggestion) => (
                              <CommandItem
                                key={suggestion}
                                value={suggestion}
                                onSelect={() => {
                                  setEmail(suggestion)
                                  setOpenCombobox(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    email === suggestion ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {suggestion}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <Button
                onClick={handleInvite}
                disabled={!email}
                className="sm:w-auto w-full"
              >
                Undang
              </Button>
            </div>
          </div>
        </Card>

        {/* Current Members Section */}
        <Card className="p-6 shadow-sm border-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Anggota Project</h2>
              <p className="text-sm text-gray-600">
                Daftar anggota yang memiliki akses ke project ini
              </p>
            </div>
          </div>

          {project.members.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              {project.members.map((member, index) => (
                <div
                  key={member.user.id}
                  className={cn(
                    "px-4 py-3 flex items-center justify-between",
                    index !== project.members.length - 1 && "border-b"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {member.user.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{member.user.email}</span>
                  </div>
                  {member.user.email === currentUserEmail ? (
                    <Badge variant="secondary">Anda</Badge>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() =>
                        setMemberToDelete({ userId: member.user.id, email: member.user.email })
                      }
                    >
                      Hapus
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-gray-500 border rounded-lg">
              Belum ada anggota selain Anda
            </div>
          )}
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-100 bg-red-50/50">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-red-100 text-red-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-semibold text-lg text-red-800">Zona Bahaya</h2>
                <div className="text-sm text-red-600">
                  Aksi ini tidak dapat dibatalkan dan akan menghapus semua data project
                </div>
              </div>
            </div>

            <Separator className="my-4 bg-red-200" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="font-medium text-red-800">Hapus Project</div>
                <div className="text-sm text-red-600">
                  Semua data termasuk tasks dan anggota akan dihapus permanent
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={() => setOpenDeleteDialog(true)}
                className="shadow-sm w-full sm:w-auto"
              >
                Hapus Project
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Delete Project Dialog */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-red-100">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <DialogTitle className="text-red-800">Hapus Project</DialogTitle>
              </div>
              <Separator className="bg-red-200" />
            </div>
          </DialogHeader>

          <DialogDescription className="py-2">
            Anda akan menghapus project: <span className="font-semibold">"{project.name}"</span><br />
            <span className="text-sm text-red-600">
              Semua data termasuk tasks dan anggota project akan dihapus permanent dan tidak dapat dikembalikan.
            </span>
          </DialogDescription>


          <DialogFooter className="mt-4">
            <Button
              onClick={() => setOpenDeleteDialog(false)}
              variant="outline"
              className="border-gray-300 hover:bg-gray-50"
            >
              Batal
            </Button>
            <Button
              onClick={handleDeleteProject}
              variant="destructive"
              disabled={isDeleting}
              className="shadow-sm"
            >
              {isDeleting ? 'Menghapus...' : 'Ya, Hapus Permanent'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!memberToDelete} onOpenChange={() => setMemberToDelete(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-red-100">
                  <Trash className="w-5 h-5 text-red-600" />
                </div>
                <DialogTitle className="text-red-800">Hapus Anggota</DialogTitle>
              </div>
              <Separator className="bg-red-200" />
            </div>
          </DialogHeader>

          {memberToDelete && (
            <>
              <DialogDescription className="py-2">
                Anda akan menghapus anggota: <span className="font-semibold">{memberToDelete.email}</span>
                <br />
                <span className="text-sm text-red-600">
                  Semua tugas yang ditugaskan ke anggota ini akan dipindahkan ke pemilik project.
                </span>
              </DialogDescription>

              <DialogFooter className="mt-4">
                <Button
                  onClick={() => setMemberToDelete(null)}
                  variant="outline"
                >
                  Batal
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleRemoveMember(memberToDelete.userId)}
                >
                  Ya, Hapus
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}