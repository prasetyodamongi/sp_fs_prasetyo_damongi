'use client';
import React from 'react';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    useDroppable,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Pencil, Trash, Plus, Settings, Users, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import {
    fetchProjectData,
    createNewTask,
    updateTaskStatus,
    modifyTask,
    removeTask,
    getCurrentUserId,
    Task
} from '@/lib/taskApi';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';

// Komponen Sortable Task Item
function SortableItem({ task, onEdit, onDelete, isOwner }: {
    task: Task;
    onEdit: () => void;
    onDelete?: () => void;
    isOwner: boolean;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white p-4 border rounded-lg shadow-sm hover:shadow-md transition-all"
        >
            <div className="flex justify-between items-start gap-3">
                <div
                    className="cursor-move select-none flex-1 min-w-0"
                    {...attributes}
                    {...listeners}
                >
                    <h3 className="font-medium text-gray-800 truncate">{task.title}</h3>
                    {task.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                    )}

                    {task.assignee && (
                        <p className="text-xs text-gray-500 mt-1">
                            Ditugaskan ke: <span className="font-medium text-gray-700">{task.assignee.email}</span>
                        </p>
                    )}

                    <div className="mt-2 flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className={`text-xs capitalize ${task.status === 'TODO' ? 'bg-gray-100 border-gray-200' :
                                task.status === 'IN_PROGRESS' ? 'bg-blue-100 border-blue-200 text-blue-800' :
                                    'bg-green-100 border-green-200 text-green-800'
                                }`}
                        >
                            {task.status.replace('-', ' ')}
                        </Badge>
                    </div>
                </div>

                <div className="flex gap-1">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onEdit();
                        }}
                        className="text-gray-600 hover:bg-gray-100 h-8 w-8 p-0"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    {isOwner && onDelete && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onDelete();
                            }}
                            className="text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                        >
                            <Trash className="w-3.5 h-3.5" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

// Komponen Task Column
function DroppableColumn({ id, title, children }: {
    id: string;
    title: string;
    children: React.ReactNode
}) {
    const { setNodeRef } = useDroppable({ id });

    return (
        <Card
            ref={setNodeRef}
            className={`p-4 space-y-4 min-h-[300px] ${id === 'TODO' ? 'bg-gray-50 border-gray-200' :
                id === 'IN_PROGRESS' ? 'bg-blue-50 border-blue-200' :
                    'bg-green-50 border-green-200'
                }`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-gray-800 capitalize">
                        {title.replace('-', ' ')}
                    </h2>
                    <Badge variant="secondary" className="px-2 py-0.5 text-xs">
                        {React.Children.count(children)}
                    </Badge>
                </div>
            </div>
            <div className="space-y-3">
                {children}
            </div>
        </Card>
    );
}

export default function ProjectDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [project, setProject] = useState<any>(null);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [openAddTask, setOpenAddTask] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [deletingTask, setDeletingTask] = useState<Task | null>(null);
    const [selectedAssignee, setSelectedAssignee] = useState<string | undefined>(undefined);

    const sensors = useSensors(useSensor(PointerSensor));
    const userId = getCurrentUserId();
    const isOwner = userId === project?.ownerId;

    useEffect(() => {
        if (id) loadProject();
    }, [id]);

    const loadProject = async () => {
        try {
            const data = await fetchProjectData(id as string);
            setProject(data);
        } catch (error) {
            console.error('Failed to load project:', error);
        }
    };

    const handleAddTask = async () => {
        try {
            const assigneeId =
                selectedAssignee ||
                (project?.members?.length === 0 ? project?.ownerId : undefined);

            await createNewTask(id as string, {
                title: newTitle,
                description: newDescription,
                assigneeId,
            });

            setNewTitle('');
            setNewDescription('');
            setSelectedAssignee(undefined);
            setOpenAddTask(false);
            await loadProject();
        } catch (error) {
            console.error('Failed to add task:', error);
        }
    };


    const handleUpdateTask = async () => {
        if (!editingTask || !userId) return;
        try {
            await modifyTask(editingTask.id, {
                title: editingTask.title,
                description: editingTask.description,
                status: editingTask.status,
                assigneeId: userId,
            });
            setEditingTask(null);
            await loadProject();
        } catch (error) {
            console.error('Failed to update task:', error);
        }
    };

    const handleDeleteTask = async () => {
        if (!deletingTask) return;
        try {
            await removeTask(deletingTask.id);
            setDeletingTask(null);
            await loadProject();
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || !userId || active.id === over.id) return;

        const newStatus = over?.data?.current?.sortable?.containerId || over.id;
        if (!['TODO', 'IN_PROGRESS', 'DONE'].includes(newStatus)) return;

        try {
            await updateTaskStatus(active.id as string, newStatus as Task['status'], userId);
            await loadProject();
        } catch (error) {
            console.error('Failed to update task status:', error);
        }
    };

    const groupedTasks: Record<Task['status'], Task[]> = {
        TODO: project?.tasks.filter((t: Task) => t.status === 'TODO') || [],
        IN_PROGRESS: project?.tasks.filter((t: Task) => t.status === 'IN_PROGRESS') || [],
        DONE: project?.tasks.filter((t: Task) => t.status === 'DONE') || [],
    };


    if (!project) return (
        <div className="p-6 flex justify-center">
            <div className="animate-pulse text-gray-500">Memuat project...</div>
        </div>
    );

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col space-y-4">
                <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="w-fit gap-2 px-0 hover:bg-transparent hover:underline"
                    onClick={() => router.back()}
                >
                    <div className="flex items-center cursor-pointer">
                        <ChevronLeft className="w-4 h-4" />
                        Kembali ke Dashboard
                    </div>
                </Button>

                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">Project Board</h1>
                    <div className="text-sm text-gray-500">Project: {project.name}</div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
                <Link
                    href={`/projects/${id}/settings`}
                >
                    <Button variant="outline" className="gap-2">
                        <Settings className="w-4 h-4" />
                        Pengaturan
                    </Button>
                </Link>
                {isOwner && (
                    <Button
                        onClick={() => setOpenAddTask(true)}
                        className="gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Tugas
                    </Button>
                )}
            </div>

            {/* Add Task Dialog */}
            <Dialog open={openAddTask} onOpenChange={setOpenAddTask}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            Tambah Tugas Baru
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">Judul</label>
                            <Input
                                placeholder="Masukkan judul tugas"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">Deskripsi</label>
                            <Input
                                placeholder="Masukkan deskripsi tugas (opsional)"
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                            />
                        </div>
                        {project.members.length > 0 ? (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600">Penanggung Jawab</label>
                                <Select
                                    value={selectedAssignee}
                                    onValueChange={(value) => setSelectedAssignee(value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Pilih anggota" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {project.members.map((m: any) => (
                                            <SelectItem key={m.user.id} value={m.user.id}>
                                                {m.user.email}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic">
                                Belum ada anggota. Tugas akan otomatis ditugaskan ke pemilik project.
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setOpenAddTask(false)} variant="outline">
                            Batal
                        </Button>
                        <Button onClick={handleAddTask}>Simpan Tugas</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Task Dialog */}
            <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    {editingTask && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Pencil className="w-5 h-5" />
                                    Edit Tugas
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600">Judul</label>
                                    <Input
                                        value={editingTask.title}
                                        onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600">Deskripsi</label>
                                    <Input
                                        value={editingTask.description}
                                        onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                                    />
                                </div>
                                {(isOwner || editingTask.assigneeId === userId) && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-600">Status</label>
                                        <select
                                            className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={editingTask.status}
                                            onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as Task['status'] })}
                                        >
                                            <option value="TODO">Todo</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="DONE">Done</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button onClick={() => setEditingTask(null)} variant="outline">Batal</Button>
                                <Button onClick={handleUpdateTask}>Simpan Perubahan</Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Task Dialog */}
            <Dialog open={!!deletingTask} onOpenChange={() => setDeletingTask(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    {deletingTask && (
                        <>
                            <DialogHeader>
                                <div className="flex flex-col space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-full bg-red-100">
                                            <Trash className="w-5 h-5 text-red-600" />
                                        </div>
                                        <DialogTitle className="text-red-800">Hapus Tugas</DialogTitle>
                                    </div>
                                    <Separator className="bg-red-200" />
                                </div>
                            </DialogHeader>

                            <DialogDescription className="py-2">
                                <p className="text-gray-700 mb-2">
                                    Anda akan menghapus tugas: <span className="font-semibold">"{deletingTask.title}"</span>
                                </p>
                                <p className="text-sm text-red-600">
                                    Aksi ini tidak dapat dibatalkan dan akan menghapus tugas permanent.
                                </p>
                            </DialogDescription>

                            <DialogFooter>
                                <Button
                                    onClick={() => setDeletingTask(null)}
                                    variant="outline"
                                    className="border-gray-300 hover:bg-gray-50"
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={handleDeleteTask}
                                    variant="destructive"
                                >
                                    Ya, Hapus
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Task Board */}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(['TODO', 'IN_PROGRESS', 'DONE'] as const).map((status) => (
                        <SortableContext
                            key={status}
                            id={status}
                            items={groupedTasks[status].map((t: Task) => t.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <DroppableColumn id={status} title={status}>
                                {groupedTasks[status].map((task: Task) => (
                                    <SortableItem
                                        key={task.id}
                                        task={task}
                                        isOwner={isOwner}
                                        onEdit={() => setEditingTask(task)}
                                        onDelete={isOwner ? () => setDeletingTask(task) : undefined}
                                    />
                                ))}
                            </DroppableColumn>
                        </SortableContext>
                    ))}
                </div>
            </DndContext>

            {/* Members Section */}
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

                <div className="flex flex-wrap gap-3">
                    {project.members.map((m: any) => (
                        <div
                            key={m.id}
                            className="flex items-center gap-3 bg-white p-3 rounded-lg border shadow-sm"
                        >
                            <div
                                className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold"
                                title={m.user.email}
                            >
                                {m.user.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-800">{m.user.email}</p>
                                {m.user.id === project.ownerId ? (
                                    <Badge variant="secondary" className="mt-1">Pemilik</Badge>
                                ) : (
                                    <Badge variant="outline" className="mt-1">Anggota</Badge>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}