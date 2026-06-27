
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useCollection, useFirestore } from '@/firebase';
import { 
  collection, query, orderBy, doc, updateDoc, deleteDoc, 
  addDoc, serverTimestamp 
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  Target, Cpu, LogOut, CheckCircle2, 
  XCircle, Trash2, Plus, Loader2, Edit3, Database, X, Orbit
} from 'lucide-react';
import { getAuth, signOut } from 'firebase/auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { uploadToGithub } from '@/app/actions/github-actions';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Image from 'next/image';

export default function AdminPage() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('applications');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const initialBikeState = { 
    name: '', 
    category: 'Matic', 
    startingPrice: '',
    image: '',
    description_id: '',
    description_en: '',
    engineType: '',
    displacement: '',
    maxPower: '',
    fuelSystem: '',
    variants: [{ name: 'Standard', price: '', color: 'Black' }],
    gallery: [] as string[],
    leasingTable: [] as any[]
  };
  
  const [bikeForm, setBikeForm] = useState(initialBikeState);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  const appsQuery = useMemo(() => db ? query(collection(db, 'creditApplications'), orderBy('createdAt', 'desc')) : null, [db]);
  const bikesQuery = useMemo(() => db ? query(collection(db, 'motorcycles'), orderBy('name', 'asc')) : null, [db]);

  const { data: applications, loading: appsLoading } = useCollection(appsQuery);
  const { data: motorcycles, loading: bikesLoading } = useCollection(bikesQuery);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  if (authLoading || !user) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-black h-8 w-8" /></div>;

  const handleLogout = () => {
    signOut(getAuth());
    router.push('/login');
  };

  const updateAppStatus = (id: string, status: string) => {
    if (!db) return;
    const docRef = doc(db, 'creditApplications', id);
    updateDoc(docRef, { status })
      .then(() => toast({ title: "Updated", description: `Application ${status}.` }))
      .catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: { status } }));
      });
  };

  const deleteRecord = (col: string, id: string) => {
    if (!db) return;
    if (confirm('Delete this entry?')) {
      const docRef = doc(db, col, id);
      deleteDoc(docRef)
        .then(() => toast({ title: "Deleted" }))
        .catch(async (err) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'delete' }));
        });
    }
  };

  const openEditBike = (bike: any) => {
    setEditingId(bike.id);
    setBikeForm({
      ...initialBikeState,
      ...bike,
      startingPrice: bike.startingPrice?.toString() || '',
      variants: bike.variants || [{ name: 'Standard', price: '', color: 'Black' }]
    });
    setIsAddOpen(true);
  };

  const handleBikeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    setUploading(true);

    try {
      let mainImageUrl = bikeForm.image;
      if (selectedFile) {
        const base64 = await toBase64(selectedFile);
        mainImageUrl = await uploadToGithub(selectedFile.name, base64.split(',')[1], bikeForm.name);
      }

      const galleryUrls = [...(bikeForm.gallery || [])];
      for (const file of galleryFiles) {
        const base64 = await toBase64(file);
        const url = await uploadToGithub(file.name, base64.split(',')[1], bikeForm.name);
        galleryUrls.push(url);
      }

      const finalData = {
        ...bikeForm,
        image: mainImageUrl,
        gallery: galleryUrls,
        startingPrice: Number(bikeForm.startingPrice),
        updatedAt: serverTimestamp(),
        createdAt: editingId ? bikeForm.createdAt : serverTimestamp()
      };

      if (editingId) {
        await updateDoc(doc(db, 'motorcycles', editingId), finalData);
      } else {
        await addDoc(collection(db, 'motorcycles'), finalData);
      }

      setIsAddOpen(false);
      setEditingId(null);
      setBikeForm(initialBikeState);
      setSelectedFile(null);
      setGalleryFiles([]);
      toast({ title: "Success", description: "Inventory updated." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setUploading(false);
    }
  };

  const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col lg:flex-row">
      {/* Sidebar / Top Nav Mobile */}
      <aside className={cn(
        "bg-white border-r border-zinc-100 flex flex-col transition-all",
        isMobile ? "w-full border-b sticky top-0 z-50 p-3" : "w-64 p-6 sticky top-0 h-screen"
      )}>
        <div className={cn("flex items-center justify-between", !isMobile && "mb-10")}>
          <h1 className="text-[12px] font-extrabold tracking-[0.2em] text-black uppercase">
            EVAN HONDA
          </h1>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-zinc-400 hover:text-black"><LogOut className="w-4 h-4" /></Button>
          )}
        </div>

        {!isMobile && (
          <>
            <nav className="flex-1 space-y-1">
              <SidebarBtn active={activeTab === 'applications'} onClick={() => setActiveTab('applications')} icon={<Target className="w-3.5 h-3.5" />} label="Inbound Leads" />
              <SidebarBtn active={activeTab === 'motorcycles'} onClick={() => setActiveTab('motorcycles')} icon={<Cpu className="w-3.5 h-3.5" />} label="Inventory" />
            </nav>
            <div className="pt-6 border-t border-zinc-100">
              <Button variant="ghost" className="w-full justify-start rounded-xl gap-3 text-zinc-400 hover:text-red-500 h-10 text-[9px] font-bold uppercase tracking-widest" onClick={handleLogout}>
                <LogOut className="w-3.5 h-3.5" /> Terminate Session
              </Button>
            </div>
          </>
        )}

        {isMobile && (
          <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
            <MobileTab active={activeTab === 'applications'} onClick={() => setActiveTab('applications')} icon={<Target className="w-3 h-3" />} label="Leads" />
            <MobileTab active={activeTab === 'motorcycles'} onClick={() => setActiveTab('motorcycles')} icon={<Cpu className="w-3 h-3" />} label="Inventory" />
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6 lg:space-y-10">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl lg:text-5xl font-bold tracking-tight text-black">
                {activeTab === 'applications' ? 'Command' : 'Lineup'}
              </h2>
              <p className="text-zinc-400 text-[9px] font-bold uppercase tracking-[0.3em] flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Node Active
              </p>
            </div>

            {activeTab === 'motorcycles' && (
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-black text-white rounded-xl h-9 lg:h-12 px-4 lg:px-6 font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-black/10 flex items-center gap-2 hover:scale-[1.02] transition-all">
                    <Plus className="w-3.5 h-3.5" /> New Asset
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white border-none rounded-[24px] lg:rounded-[32px] p-0 overflow-hidden max-w-4xl shadow-2xl">
                  <DialogHeader className="p-4 lg:p-6 border-b border-zinc-50 bg-[#fafafa]">
                    <DialogTitle className="text-base lg:text-xl font-bold tracking-tight">Manage Node Asset</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="max-h-[80vh] p-4 lg:p-8">
                    <form onSubmit={handleBikeSubmit} className="space-y-6 lg:space-y-10">
                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
                         <div className="space-y-4">
                           <div className="space-y-1.5">
                             <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">Model Name</label>
                             <Input value={bikeForm.name} onChange={(e) => setBikeForm({...bikeForm, name: e.target.value})} required className="h-10 lg:h-12 rounded-xl border-zinc-100 bg-zinc-50/50" />
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-1.5">
                               <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">Category</label>
                               <select value={bikeForm.category} onChange={(e) => setBikeForm({...bikeForm, category: e.target.value as any})} className="w-full h-10 lg:h-12 rounded-xl border border-zinc-100 bg-zinc-50/50 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-black">
                                 {['Matic', 'Sport', 'Cub', 'Adventure', 'Electric'].map(c => <option key={c}>{c}</option>)}
                               </select>
                             </div>
                             <div className="space-y-1.5">
                               <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">OTR Price</label>
                               <Input type="number" value={bikeForm.startingPrice} onChange={(e) => setBikeForm({...bikeForm, startingPrice: e.target.value})} required className="h-10 lg:h-12 rounded-xl border-zinc-100 bg-zinc-50/50" />
                             </div>
                           </div>
                           <div className="space-y-1.5">
                             <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">Description (ID)</label>
                             <Textarea value={bikeForm.description_id} onChange={(e) => setBikeForm({...bikeForm, description_id: e.target.value})} className="min-h-[100px] rounded-xl border-zinc-100 bg-zinc-50/50" />
                           </div>
                         </div>
                         <div className="space-y-4">
                           <div className="space-y-1.5">
                             <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">Primary Photo</label>
                             <Input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="h-10 lg:h-12 rounded-xl border-zinc-100 bg-zinc-50/50 text-[10px]" />
                           </div>
                           <div className="space-y-1.5">
                             <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">Gallery Assets</label>
                             <Input type="file" multiple onChange={(e) => setGalleryFiles(Array.from(e.target.files || []))} className="h-10 lg:h-12 rounded-xl border-zinc-100 bg-zinc-50/50 text-[10px]" />
                           </div>
                         </div>
                       </div>
                       <Button disabled={uploading} type="submit" className="w-full h-12 lg:h-16 bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl shadow-black/10">
                         {uploading ? <Loader2 className="animate-spin" /> : 'Commit Node Changes'}
                       </Button>
                    </form>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <Card className="rounded-[20px] lg:rounded-[24px] border-zinc-100 bg-white shadow-sm overflow-hidden border">
            {activeTab === 'applications' ? (
              <Table>
                <TableHeader className="bg-zinc-50/50">
                  <TableRow className="hover:bg-transparent border-zinc-100">
                    <TableHead className="text-[9px] font-extrabold uppercase tracking-widest text-zinc-400 h-10 px-6">Lead Identity</TableHead>
                    <TableHead className="text-[9px] font-extrabold uppercase tracking-widest text-zinc-400 h-10 hidden lg:table-cell">Target Unit</TableHead>
                    <TableHead className="text-[9px] font-extrabold uppercase tracking-widest text-zinc-400 h-10">Status</TableHead>
                    <TableHead className="text-[9px] font-extrabold uppercase tracking-widest text-zinc-400 h-10 text-right px-6">Control</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appsLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-20"><Loader2 className="animate-spin inline-block text-zinc-200" /></TableCell></TableRow>
                  ) : applications?.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-20 text-[10px] font-bold text-zinc-300 uppercase tracking-widest">No inbound leads</TableCell></TableRow>
                  ) : applications?.map(app => (
                    <TableRow key={app.id} className="hover:bg-zinc-50/50 transition-colors border-zinc-50">
                      <TableCell className="px-6 py-4">
                        <p className="font-bold text-sm tracking-tight">{app.name}</p>
                        <p className="text-[10px] text-zinc-400 font-medium">{app.phone} • {app.city}</p>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell py-4">
                        <p className="font-bold text-xs text-zinc-900">{app.motorcycleName}</p>
                        <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">DP {app.dpPercentage}% • {app.tenure}M</p>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge className={cn(
                          "text-[8px] font-bold px-2.5 py-1 rounded-md border shadow-none uppercase tracking-widest", 
                          app.status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' : 
                          app.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' : 
                          'bg-yellow-50 text-yellow-600 border-yellow-100'
                        )}>
                          {app.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right px-6 py-4">
                        <div className="flex gap-1 justify-end">
                          <Button size="icon" variant="ghost" onClick={() => updateAppStatus(app.id, 'approved')} className="h-8 w-8 text-green-600 hover:bg-green-50"><CheckCircle2 className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => updateAppStatus(app.id, 'rejected')} className="h-8 w-8 text-red-500 hover:bg-red-50"><XCircle className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteRecord('creditApplications', app.id)} className="h-8 w-8 text-zinc-200 hover:text-red-500 hover:bg-transparent"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Table>
                <TableHeader className="bg-zinc-50/50">
                  <TableRow className="hover:bg-transparent border-zinc-100">
                    <TableHead className="text-[9px] font-extrabold uppercase tracking-widest text-zinc-400 h-10 px-6">Asset Descriptor</TableHead>
                    <TableHead className="text-[9px] font-extrabold uppercase tracking-widest text-zinc-400 h-10 hidden lg:table-cell">Valuation</TableHead>
                    <TableHead className="text-[9px] font-extrabold uppercase tracking-widest text-zinc-400 h-10 text-right px-6">Control</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bikesLoading ? (
                    <TableRow><TableCell colSpan={3} className="text-center py-20"><Loader2 className="animate-spin inline-block text-zinc-200" /></TableCell></TableRow>
                  ) : motorcycles?.length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="text-center py-20 text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Inventory empty</TableCell></TableRow>
                  ) : motorcycles?.map(bike => (
                    <TableRow key={bike.id} className="hover:bg-zinc-50/50 transition-colors border-zinc-50">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-zinc-100 overflow-hidden relative border border-zinc-200 shrink-0">
                             {bike.image && <Image src={bike.image.startsWith('http') ? bike.image : `/api/placeholder`} alt="" fill className="object-cover" />}
                          </div>
                          <div>
                            <p className="font-bold text-sm tracking-tight">{bike.name}</p>
                            <p className="text-[9px] text-zinc-400 uppercase tracking-[0.2em] font-bold">{bike.category} Unit</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell py-4">
                        <p className="font-mono text-sm font-bold text-zinc-900">Rp {bike.startingPrice?.toLocaleString('id-ID')}</p>
                      </TableCell>
                      <TableCell className="text-right px-6 py-4">
                        <div className="flex gap-1 justify-end">
                          <Button size="icon" variant="ghost" onClick={() => openEditBike(bike)} className="h-8 w-8 text-zinc-400 hover:text-black hover:bg-zinc-100"><Edit3 className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteRecord('motorcycles', bike.id)} className="h-8 w-8 text-zinc-200 hover:text-red-500 hover:bg-transparent"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}

function SidebarBtn({ active, icon, label, onClick }: { active: boolean, icon: any, label: string, onClick: () => void }) {
  return (
    <Button variant="ghost" onClick={onClick} className={cn(
      "w-full justify-start rounded-xl gap-3 h-10 font-bold text-[10px] transition-all uppercase tracking-widest",
      active ? "bg-black text-white shadow-xl shadow-black/10" : "text-zinc-400 hover:bg-zinc-50 hover:text-black"
    )}>
      {icon} {label}
    </Button>
  );
}

function MobileTab({ active, icon, label, onClick }: { active: boolean, icon: any, label: string, onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn(
      "px-5 py-2.5 rounded-xl flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all shrink-0 border",
      active ? "bg-black text-white border-black shadow-lg shadow-black/5" : "bg-white border-zinc-100 text-zinc-400"
    )}>
      {icon} {label}
    </button>
  );
}
